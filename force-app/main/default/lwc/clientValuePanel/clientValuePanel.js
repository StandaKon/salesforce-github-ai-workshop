import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import PORTFOLIO_VALUE_FIELD from '@salesforce/schema/Account.TotalPortfolioValue__c';
import ACTIVE_PRODUCTS_FIELD from '@salesforce/schema/Account.ActiveProducts__c';
import CREDIT_EXPOSURE_FIELD from '@salesforce/schema/Account.CreditExposure__c';
import PROFITABILITY_FIELD from '@salesforce/schema/Account.ClientProfitability__c';
import CROSS_SELL_POTENTIAL_FIELD from '@salesforce/schema/Account.CrossSellPotential__c';
import LAST_CONTACT_DATE_FIELD from '@salesforce/schema/Account.LastContactDate__c';

const FIELDS = [
    PORTFOLIO_VALUE_FIELD,
    ACTIVE_PRODUCTS_FIELD,
    CREDIT_EXPOSURE_FIELD,
    PROFITABILITY_FIELD,
    CROSS_SELL_POTENTIAL_FIELD,
    LAST_CONTACT_DATE_FIELD
];

const NEXT_BEST_ACTION_BY_POTENTIAL = {
    High: { label: 'Schedule a Meeting', icon: 'utility:event', cssSuffix: 'high' },
    Medium: { label: 'Call by Account Manager', icon: 'utility:call', cssSuffix: 'medium' },
    Low: { label: 'Marketing Campaign', icon: 'utility:announcement', cssSuffix: 'low' }
};

export default class ClientValuePanel extends LightningElement {
    @api recordId;

    account;
    errorMessage;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ data, error }) {
        if (data) {
            this.account = data;
            this.errorMessage = undefined;
        } else if (error) {
            this.account = undefined;
            this.errorMessage = this.reduceError(error);
        }
    }

    get portfolioValue() {
        return getFieldValue(this.account, PORTFOLIO_VALUE_FIELD);
    }

    get activeProducts() {
        return getFieldValue(this.account, ACTIVE_PRODUCTS_FIELD);
    }

    get creditExposure() {
        return getFieldValue(this.account, CREDIT_EXPOSURE_FIELD);
    }

    get profitability() {
        return getFieldValue(this.account, PROFITABILITY_FIELD);
    }

    get crossSellPotential() {
        return getFieldValue(this.account, CROSS_SELL_POTENTIAL_FIELD);
    }

    get lastContactDate() {
        return getFieldValue(this.account, LAST_CONTACT_DATE_FIELD);
    }

    get hasCrossSellPotential() {
        return Boolean(this.crossSellPotential);
    }

    get hasLastContactDate() {
        return Boolean(this.lastContactDate);
    }

    get nextBestAction() {
        return NEXT_BEST_ACTION_BY_POTENTIAL[this.crossSellPotential];
    }

    get hasNextBestAction() {
        return Boolean(this.nextBestAction);
    }

    get nextBestActionLabel() {
        return this.nextBestAction?.label;
    }

    get nextBestActionIcon() {
        return this.nextBestAction?.icon ?? 'utility:announcement';
    }

    get nextBestActionLabelCssClass() {
        const suffix = this.nextBestAction?.cssSuffix ?? 'none';
        return `cvp-action-label cvp-action-label--${suffix}`;
    }

    reduceError(error) {
        return error?.body?.message ?? error?.message ?? 'Unknown error';
    }
}
