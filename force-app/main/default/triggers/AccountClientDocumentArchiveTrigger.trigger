trigger AccountClientDocumentArchiveTrigger on Account (before delete) {
    ClientDocumentArchiveService.archiveDocumentsForDeletedAccounts(Trigger.old);
}
