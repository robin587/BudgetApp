//Budget Controller
let budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome){
    if( totalIncome > 0 ){
      this.percentage = Math.round((this.value / totalIncome) * 100);
    }
  };

  Expense.prototype.getPercentage = function(){
      return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let data = {
    allItems: {
      expenses: [],
      income: []
    },
    totals: {
      expense: 0,
      income: 0
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal = function(type){
      var sum = 0;
      if( type === 'inc'){
         data.allItems["income"].forEach(function(cur){
             sum += cur.value;
         })
         data.totals["income"] = sum;
      }else if(type === 'exp'){
        data.allItems["expenses"].forEach(function(cur){
            sum += cur.value;
        })
        data.totals["expense"] = sum;
      }
  };

  return {
    addItem: function(type, description, value) {
      var newItem, ID;
      ID = ID++;
      if (type === "inc") {
        if (data.allItems["income"].length > 0) {
          ID =
            data.allItems["income"][data.allItems["income"].length - 1].id + 1;
        } else {
          ID = 0;
        }
        newItem = new Income(ID, description, value);
        data.allItems["income"].push(newItem);
      } else if (type === "exp") {
        if (data.allItems["expenses"].length > 0) {
          ID =
            data.allItems["expenses"][data.allItems["expenses"].length - 1].id +
            1;
        } else {
          ID = 0;
        }
        newItem = new Expense(ID, description, value);
        data.allItems["expenses"].push(newItem);
      }
      return newItem;
    },
    
    deleteItem: function(type, id){
      var ids;
       
      if ( type == 'income'){
       ids = data.allItems['income'].map(function(current){
           return current.id;
        });
        index = ids.indexOf(id);
        data.allItems['income'].splice(index,1);
      }else if ( type == 'expense'){
        ids = data.allItems['expenses'].map(function(current){
          return current.id;
       });
       index = ids.indexOf(id);
       data.allItems['expenses'].splice(index,1);
      }
    },

    calculateBudget: function(){
       calculateTotal('exp');
       calculateTotal('inc');

       data.budget = data.totals.income - data.totals.expense;

       if( data.totals.income > 0){
         data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
       }else{
         data.percentage = -1;
       }

    },

    caluclatePercentages: function(){
       data.allItems.expenses.forEach(function(currentVariable){
         currentVariable.calcPercentage(data.totals.income);
       });
    },

    getPercentages: function(){
      var allPercentages = data.allItems.expenses.map(function(cur){
          return cur.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function(){
        return {
           budget: data.budget,
           totalIncome: data.totals.income,
           totalExpenses: data.totals.expense,
           percentage: data.percentage
        }

    },

    testFunction: function() {
      console.log(data);
    }
  };
})();

//UI Controller
let uiController = (function() {
  let domStrings = {
    inputType: ".add__type",
    description: ".add__description",
    value: ".add__value",
    addButton: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    expenseLabel: ".budget__expenses--value",
    incomeLabel: ".budget__income--value",
    budgetPercentageLabel: ".budget__expenses--percentage",
    container: ".container__clearfix",
    expensesPercentageLabel: ".item__percentage",
    dateLable:".budget__title--month"
  };

  var formatNumber = function(num, type){
    var numSplit, int, decimal;
      
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.')
    int = numSplit[0];
    decimal = numSplit[1];

    if( int.length > 3){
      int = int.substr(0,int.length - 3 ) + ',' + int.substr(int.length - 3,3);
    }

    type === 'exp' ? sign = '-' : sign = '+';
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + decimal;

  }; 

  var nodelListForEach = function(list,callBack){
    for(var i=0 ; i < list.length; i++){
         callBack(list[i],i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.description).value,
        value: parseFloat(document.querySelector(domStrings.value).value)
      };
    },

    addListItem: function(object, type) {
      var html, newhtml, element;

      if (type === "inc") {
        element = domStrings.incomeContainer;
        html =
        '<div class="item clearfix" id="income-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === "exp") {
        element = domStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newhtml = html.replace("%id%", object.id);
      newhtml = newhtml.replace("%desc%", object.description);
      newhtml = newhtml.replace("%value%", formatNumber(object.value,type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newhtml);
    },

    deleteListItem : function(selectorId){
       var el = document.getElementById(selectorId);
       el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll(
        domStrings.description + "," + domStrings.value
      );

      fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArray[0].focus();
    },

    displayBudget: function(obj){
      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(domStrings.budgetLabel).textContent=formatNumber(obj.budget,type),

      document.querySelector(domStrings.expenseLabel).textContent=formatNumber(obj.totalExpenses,'exp'),

      document.querySelector(domStrings.incomeLabel).textContent=formatNumber(obj.totalIncome,'inc')

      if( obj.percentage >0 ){
        document.querySelector(domStrings.budgetPercentageLabel).textContent=obj.percentage + '%'
      }else{
        document.querySelector(domStrings.budgetPercentageLabel).textContent='--'
      }
    },

    displayPercentage: function(percentages){
      var fields = document.querySelectorAll(domStrings.expensesPercentageLabel);
      
      nodelListForEach(fields,function(current,index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }else{
           current.textContent = '---';
        }
      });

    },

    dispalymonth : function(){
      var now, months, month , year;
      
      now = new Date();
      months= ['Jan','Feb','March','April','May','June','July','August','Sep','Oct','Nov','Dec'];
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(domStrings.dateLable).textContent = months[month]   + ' ' + year;

    },

    changeType: function(){
       var fields = document.querySelectorAll(
         domStrings.inputType +  ',' +
         domStrings.description + ',' +
         domStrings.value);

        nodelListForEach(fields,function(cur){
            cur.classList.toggle('red-focus');
        });

        document.querySelector(domStrings.addButton).classList.toggle('red');

    },

    getDomStrings: function() {
      return domStrings;
    }
  };
})();

//Global App Controller
let controller = (function(buCtrl, uiCtrl) {
  let setupEventListeners = function() {
    let domString = uiController.getDomStrings();
    document
      .querySelector(domString.addButton)
      .addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(e) {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(domString.container).addEventListener("click",ctrlDeleteItem);

    document.querySelector(domString.inputType).addEventListener("change", uiCtrl.changeType);
  };

  var updateBudget = function() {
       buCtrl.calculateBudget();  
       var budget = buCtrl.getBudget();
       console.log(budget);
       uiCtrl.displayBudget(budget);
  };

  var updatePercentages = function(){
      buCtrl.caluclatePercentages();
      var percentages = buCtrl.getPercentages();
      console.log(percentages);
      uiCtrl.displayPercentage(percentages);
  };

  let ctrlAddItem = function() {
    let input = uiController.getInput();

      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
          var newItem = buCtrl.addItem(input.type, input.description, input.value);
          uiCtrl.addListItem(newItem, input.type);
          uiCtrl.clearFields();
          updateBudget();
          updatePercentages();
      }
  };

  var ctrlDeleteItem = function(event){
    var itemID,splitID,type,ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    console.log(itemID);
    if( itemID ){
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      buCtrl.deleteItem(type, ID);

      uiCtrl.deleteListItem(itemID);

      updateBudget();

      updatePercentages();
    }

  }
  return {
    init: function() {
      console.log("Application started");
      uiCtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpenses: 0,
        percentage: 0
      });
      setupEventListeners();
      uiCtrl.dispalymonth();
    }
  };
})(budgetController, uiController);

controller.init();
