import { createElement } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import ClientValuePanel from 'c/clientValuePanel';

function flushPromises() {
    return Promise.resolve();
}

function mockAccount(fields) {
    return {
        apiName: 'Account',
        fields
    };
}

describe('c-client-value-panel', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    function createComponent() {
        const element = createElement('c-client-value-panel', { is: ClientValuePanel });
        element.recordId = '001000000000001AAA';
        document.body.appendChild(element);
        return element;
    }

    it('renders the four metric tiles with wired values', async () => {
        const element = createComponent();

        getRecord.emit(
            mockAccount({
                TotalPortfolioValue__c: { value: 1500000 },
                ActiveProducts__c: { value: 4 },
                CreditExposure__c: { value: 250000 },
                ClientProfitability__c: { value: 75000 },
                CrossSellPotential__c: { value: 'High' }
            })
        );
        await flushPromises();

        const tiles = element.shadowRoot.querySelectorAll('.cvp-tile');
        expect(tiles.length).toBe(4);
    });

    it('shows the High next best action with the correct label and CSS class', async () => {
        const element = createComponent();

        getRecord.emit(
            mockAccount({
                TotalPortfolioValue__c: { value: 1500000 },
                ActiveProducts__c: { value: 4 },
                CreditExposure__c: { value: 250000 },
                ClientProfitability__c: { value: 75000 },
                CrossSellPotential__c: { value: 'High' }
            })
        );
        await flushPromises();

        const actionLabel = element.shadowRoot.querySelector('.cvp-action-label');
        expect(actionLabel.textContent).toBe('Schedule a Meeting');
        expect(actionLabel.classList).toContain('cvp-action-label--high');
    });

    it('shows Cross-Sell Potential and Last Contact meta on the action card', async () => {
        const element = createComponent();

        getRecord.emit(
            mockAccount({
                TotalPortfolioValue__c: { value: 1500000 },
                ActiveProducts__c: { value: 4 },
                CreditExposure__c: { value: 250000 },
                ClientProfitability__c: { value: 75000 },
                CrossSellPotential__c: { value: 'High' },
                LastContactDate__c: { value: '2026-09-01' }
            })
        );
        await flushPromises();

        const metaItems = element.shadowRoot.querySelectorAll('.cvp-action-meta-item');
        expect(metaItems.length).toBe(2);
        expect(metaItems[0].textContent).toContain('High');

        const formattedDate = element.shadowRoot.querySelector('lightning-formatted-date-time');
        expect(formattedDate.value).toBe('2026-09-01');
    });

    it('hides the meta items when Cross-Sell Potential and Last Contact are blank', async () => {
        const element = createComponent();

        getRecord.emit(
            mockAccount({
                TotalPortfolioValue__c: { value: 1500000 },
                ActiveProducts__c: { value: 4 },
                CreditExposure__c: { value: 250000 },
                ClientProfitability__c: { value: 75000 },
                CrossSellPotential__c: { value: null },
                LastContactDate__c: { value: null }
            })
        );
        await flushPromises();

        const metaItems = element.shadowRoot.querySelectorAll('.cvp-action-meta-item');
        expect(metaItems.length).toBe(0);
    });

    it('shows a neutral fallback when CrossSellPotential__c is blank', async () => {
        const element = createComponent();

        getRecord.emit(
            mockAccount({
                TotalPortfolioValue__c: { value: 1500000 },
                ActiveProducts__c: { value: 4 },
                CreditExposure__c: { value: 250000 },
                ClientProfitability__c: { value: 75000 },
                CrossSellPotential__c: { value: null }
            })
        );
        await flushPromises();

        const actionLabel = element.shadowRoot.querySelector('.cvp-action-label');
        expect(actionLabel.textContent).toBe('No recommendation yet');
        expect(actionLabel.classList).toContain('cvp-action-label--none');
    });

    it('surfaces an error message when the wire fails', async () => {
        const element = createComponent();

        getRecord.error({ body: { message: 'Boom' } });
        await flushPromises();

        const alert = element.shadowRoot.querySelector('[role="alert"]');
        expect(alert.textContent).toContain('Boom');
    });
});
