public with sharing class ClientDocumentArchiveService {

    /**
     * Copies every Client_Document__c related to the given Accounts into Archived_Client_Document__c
     * before the Master-Detail cascade delete removes them. If archiving fails for any Account's
     * documents, that Account is blocked from deleting so no document is ever lost without a copy.
     */
    public static void archiveDocumentsForDeletedAccounts(List<Account> deletedAccounts) {
        Set<Id> accountIds = new Set<Id>();
        for (Account acc : deletedAccounts) {
            accountIds.add(acc.Id);
        }

        List<Client_Document__c> documentsToArchive = [
            SELECT Id, Document_Number__c, Document_Type__c, Issue_Date__c, Expiration_Date__c, Document_Status__c, Client__c, Client__r.Name
            FROM Client_Document__c
            WHERE Client__c IN :accountIds
        ];

        if (documentsToArchive.isEmpty()) {
            return;
        }

        List<Archived_Client_Document__c> archivedRecords = new List<Archived_Client_Document__c>();
        for (Client_Document__c doc : documentsToArchive) {
            archivedRecords.add(new Archived_Client_Document__c(
                Original_Document_Id__c = doc.Id,
                Original_Account_Id__c = doc.Client__c,
                Original_Account_Name__c = doc.Client__r.Name,
                Document_Number__c = doc.Document_Number__c,
                Document_Type__c = doc.Document_Type__c,
                Issue_Date__c = doc.Issue_Date__c,
                Expiration_Date__c = doc.Expiration_Date__c,
                Document_Status__c = doc.Document_Status__c,
                Archived_Date__c = System.now()
            ));
        }

        Database.SaveResult[] results = Database.insert(archivedRecords, false);
        Map<Id, Account> accountsById = new Map<Id, Account>(deletedAccounts);
        for (Integer i = 0; i < results.size(); i++) {
            if (!results[i].isSuccess()) {
                Account owningAccount = accountsById.get(documentsToArchive[i].Client__c);
                if (owningAccount != null) {
                    owningAccount.addError(System.Label.Client_Document_Archive_Failed_Error);
                }
            }
        }
    }
}
