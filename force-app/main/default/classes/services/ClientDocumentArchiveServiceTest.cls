@IsTest
private class ClientDocumentArchiveServiceTest {

    @IsTest
    static void archivesDocumentWhenAccountIsDeleted() {
        Account acc = new Account(Name = 'Test Client 1');
        insert acc;
        Client_Document__c doc = new Client_Document__c(
            Client__c = acc.Id,
            Document_Number__c = 'DOC-0001',
            Document_Type__c = 'ID_Card',
            Issue_Date__c = Date.today().addDays(-30),
            Document_Status__c = 'Valid'
        );
        insert doc;

        Test.startTest();
        delete acc;
        Test.stopTest();

        List<Archived_Client_Document__c> archived = [
            SELECT Original_Document_Id__c, Original_Account_Name__c, Document_Number__c, Document_Type__c, Document_Status__c
            FROM Archived_Client_Document__c
        ];
        System.assertEquals(1, archived.size(), 'Expected exactly one archived document.');
        System.assertEquals(doc.Id, archived[0].Original_Document_Id__c);
        System.assertEquals('Test Client 1', archived[0].Original_Account_Name__c);
        System.assertEquals('DOC-0001', archived[0].Document_Number__c);

        System.assertEquals(
            0,
            [SELECT COUNT() FROM Client_Document__c],
            'Original document should be cascade-deleted with its Account.'
        );
    }

    @IsTest
    static void deletesAccountWithoutDocumentsCleanly() {
        Account acc = new Account(Name = 'No Documents Client');
        insert acc;

        Test.startTest();
        delete acc;
        Test.stopTest();

        System.assertEquals(
            0,
            [SELECT COUNT() FROM Archived_Client_Document__c],
            'No archived records should be created for an Account with no documents.'
        );
    }

    @IsTest
    static void archivesDocumentsInBulkAccountDelete() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            accounts.add(new Account(Name = 'Bulk Client ' + i));
        }
        insert accounts;

        List<Client_Document__c> docs = new List<Client_Document__c>();
        for (Integer i = 0; i < accounts.size(); i++) {
            docs.add(new Client_Document__c(
                Client__c = accounts[i].Id,
                Document_Number__c = 'BULK-' + i,
                Document_Type__c = 'Other',
                Issue_Date__c = Date.today(),
                Document_Status__c = 'Draft'
            ));
        }
        insert docs;

        Test.startTest();
        delete accounts;
        Test.stopTest();

        System.assertEquals(
            200,
            [SELECT COUNT() FROM Archived_Client_Document__c],
            'Every document across all 200 Accounts should be archived.'
        );
    }
}
