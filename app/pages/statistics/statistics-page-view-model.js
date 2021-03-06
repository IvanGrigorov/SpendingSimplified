const { Observable } = require("tns-core-modules/data/observable");
const { convertEurosAndDollarsToLevas, convertCurrenciesToSelected } = require("./../../res/Currencies");
const { convertDate } = require("./../../res/helpfulFunctions")
const appSettings = require("application-settings");



class StatisticsViewModel extends Observable{

    constructor() {
        super();
        this._spendings = [];
        this._maxSum;
        this._maxSumEuros;
        this._maxSumDollars;
        this.maxSumLevas;
        this._labels = ["All"];
        this._labelsValue = 'All';
        this._dates = ['None', 'Today', 'This month', 'This Year']
        this._datesValue = 'None';
        this._datefilteringFunc = undefined;
        this._labelfilteringFunc = undefined;
        this._currency = appSettings.getString('currency');
        this._filteringFunc = undefined;
        this._currenciesArray = [
            {currency: "Australian dollar", sum: 0},
            {currency: "Bulgarian lev", sum: 0},
            {currency: "Brazilian real", sum: 0},
            {currency: "Canadian dollar", sum: 0},
            {currency: "Swiss franc", sum: 0},
            {currency: "United States dollar", sum: 0},
            {currency: "European Euro", sum: 0},
        ];
    }
    get currenciesArray() {
        return this._currenciesArray;
    }

    set currenciesArray(value) {
        this._currenciesArray = value;
    }

    get currency() {
        return this._currency;
    }
    get datefilteringFunc() {
        return this._datefilteringFunc;
    }

    set datefilteringFunc(value) {
        return this._datefilteringFunc = value;
    }

    get labelfilteringFunc() {
        return this._labelfilteringFunc;
    }

    set labelfilteringFunc(value) {
        this._labelfilteringFunc = value;
    }





    get label() {
        return "Label: ";
    }

    get date() {
        return "Date: ";
    }

    get labels() {
        return this._labels;
    }

    set labels(value) {
        return this._labels.push(value);
    }
    get dates() {
        return this._dates;
    }

    get datesValue() {
        return this._datesValue;
    }

    set datesValue(value) {
        this.tmpDatesValue = value;
        this.clearSums();
        this._datesValue = value;
        this.filteringFunc = this.myfilteringFunc;
        super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "filteringFunc", value: this._filteringFunc });

    }


    clearSums() {
        this.maxSum = 0;
        this.maxSumLevas = 0;
        this.maxSumEuros = 0;
        this.maxSumDollars = 0;
        this.currenciesArray = [
            {currency: "Australian dollar", sum: 0},
            {currency: "Bulgarian lev", sum: 0},
            {currency: "Brazilian real", sum: 0},
            {currency: "Canadian dollar", sum: 0},
            {currency: "Swiss franc", sum: 0},
            {currency: "United States dollar", sum: 0},
            {currency: "European Euro", sum: 0},
        ];
    }
    
    get labelsValue() {
        return this._labelsValue;
    }

    set labelsValue(value) {
        this.tmpLabelsValue = value;
        this.clearSums();
        this._labelsValue = value;
        this.filteringFunc = this.myfilteringFunc;
        super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "filteringFunc", value: this._filteringFunc });
    }

    get spendings() {
        return this._spendings;
    }

    set spendings(value) {
        this._spendings = value;
    }

    
    get maxSum() {
        return this._maxSum;
    }

    set maxSum(value) {
        this._maxSum = value;
        //super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "maxSum", value: this._maxSum });
    }

    get maxSumEuros() {
        return this._maxSumEuros;
    }

    set maxSumEuros(value) {
        this._maxSumEuros = value;
        //super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "maxSum", value: this._maxSum });
    }

    get maxSumDollars() {
        return this._maxSumDollars;
    }

    set maxSumDollars(value) {
        this._maxSumDollars = value;
        //super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "maxSum", value: this._maxSum });
    }

    get maxSumText() {
        return "Total amount: " + this.maxSum;
    }

    labelFilteringFunc(value) {
        const me = this;
        if (value.label == me.tmpLabelsValue || me.tmpLabelsValue == "All") {
            return true;
        }
        else if (!me.tmpLabelsValue) {
            return true;
        }
        return false;
        
    }

    dateFilteringFunc(value) {
        const me = this;
        switch (me.tmpDatesValue) {
            case 'Today': {
                const formattedDate = convertDate(new Date());
                if (value.when == formattedDate) {
                    return true;
                }
                return false;
            }
            case 'This month': {
                const date = new Date();
                const firstDay = convertDate(new Date(date.getFullYear(), date.getMonth(), 1));
                const lastDay = convertDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
                return me.filterByDate(me, firstDay, lastDay, value);

            }
            case 'This year': {
                const date = new Date();
                const firstDay = convertDate(new Date(date.getFullYear(), 0, 1));
                const lastDay = convertDate(new Date(new Date().getFullYear(), 11, 31));
                return me.filterByDate(me, firstDay, lastDay, value);

            }
            case 'None': {
                return true;
            }
            default: {
                return true;
            }
        }
    }

    filterByDate(scope, dateAfter, dayBefore, record) {
        if (record.when >= dateAfter &&
            record.when <= dayBefore) {
            return true;
        }
        return false;
    }

    removeItem(id) {

        this.spendings.splice(this.spendings.findIndex((spending) => {
            return spending.id == id;
        }), 1);
        
        this.clearSums();

        super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "maxSum", value: this._maxSum });

        if (!this._filteringFunc) {
            for (let i = 0; i < this.spendings.length; i++) {
                this.updateMoney(this.spendings[i]);
            }
        }
    }

    get myfilteringFunc() {
        const me = this;
        this.clearSums();
        return (value) => {
            if (me.dateFilteringFunc(value) && me.labelFilteringFunc(value)) {
                this.updateMoney(value);
                return true;
            }
            return false; 
        };
    }

    updateMoney(record) {
        let maxSum = 0;
        for(let j = 0; j < this.currenciesArray.length; j++) {
            if (record.currency == this.currenciesArray[j].currency) {
                this.currenciesArray[j].sum += parseFloat(record.sum)
            }
        }
        
        maxSum = convertCurrenciesToSelected(this.currenciesArray);
        this.maxSum = maxSum.toFixed(2);
        super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "maxSum", value: this._maxSum });
    }

    get filteringFunc() {
        this._filteringFunc;
    }

    set filteringFunc(value) {
        this.maxSum = 0;
        this.maxSumDollars = 0;
        this.maxSumEuros = 0;
        this._filteringFunc = value;
        super.notify({ object: this, eventName: Observable.propertyChangeEvent, propertyName: "filteringFunc", value: this._filteringFunc });
    }


    pushspending(value) {
        const img = this.getImageLink(value[1]);
        this._spendings.push({
            for: value[0],
            category: value[1],
            sum: value[2],
            currency: value[3],
            when: value[4],
            img: img,
            label: value[5],
            id: value[6]
        })
    }

    getImageLink(category) {
        if (!category) {
            return "res://money";
        }
        const categoryToLower = category.toLowerCase();
        return "res://" + categoryToLower;
    }
}

module.exports = {
    StatisticsViewModel: StatisticsViewModel 
}