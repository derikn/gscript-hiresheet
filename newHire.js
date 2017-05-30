/* newHire.js for initiating a new hire and hooks for scripting

*/

//Globals
const EMAIL_RECIPIENTS = '';
const 

function createNewHireObject(data) {
  /**
  create a newhire object to house information for subsequent functions
  **/
  var sup_email = nameToEmail(data[5]);
  var staff_email = nameToEmail(data[1]);
  var today = new Date();
  var newHire = {
    type : data[0],
    name : data[1],
    staffEmail : staff_email,
    position : data[2],
    phoneNumber : data[3],
    emailAddress : data[4],
    supervisor : data[5],
    supervisorEmail : sup_email,
    departments : data[6],
    driversLicense : data[7],
    firstAidExpiration : data[8],
    hasTBClearance : data[9],
    isFitChecked : data[10],
    isImmunized : data[11],
    startDate : data[12],
    recipients : data[13],
    comments : data[14],
    password : generatePassword()
    
  };
  Logger.log(newHire.password);
  return newHire
 }

function sendInternalEmail(newHire) {
  /**
  Sends the new hire email to relevant recipients
  **/
  var message = 'Hi all,\n\nThis email confirms that ' + newHire.name + ' has been hired as a ' + newHire.position + ' and will be assigned to ' + newHire.departments
  + '. The designated supervisor is ' + newHire.supervisor + 'Please add the new hire to relevant email groups in your department. You can reach ' + newHire.name + ' at ' + newHire.phoneNumber + ' or ' + newHire.emailAddress
  + '.\n\n' + newHire.comments
  + '\n\nDrivers License: ' + newHire.driversLicense
  + '\nFirst Aid Expiration: ' + newHire.firstAidExpiration
  + '\nTB Clearance: ' + newHire.hasTBClearance
  + '\nFitness Check: '+ newHire.isFitChecked
  + '\nImmunization: '+ newHire.isImmunized;
  
  if (newHire.startDate){
    message += "\nStart Date: " + newHire.startDate;
  } else{
    message += '\n';
  }
  
  var recipients = EMAIL_RECIPIENTS;

  + newHire.supervisorEmail + ',' 
  + newHire.recipients;
  
  var subject = "New Hire: " + newHire.name;
  MailApp.sendEmail(recipients, subject, message);
  
}

function createGoogleAccount(newHire){
  /**
  Create the account calling Admin SDk
  **/
  
  var userToAdd = {
    "kind": "admin#directory#user",
    "name" : {
      "givenName": newHire.name.split(' ')[0],
      "familyName": newHire.name.split(' ')[1],
      "fullName": newHire.name
    },
    "phones": [
      {
        "value": newHire.phoneNumber,
        "type": 'home'
      }
    ],
    "password": newHire.password,
    "primaryEmail": newHire.staffEmail,
    "orgUnitPath": "/Staff",
    "changePasswordAtNextLogin": true
  }
  
  AdminDirectory.Users.insert(userToAdd);
}

function sendExternalEmail(newHire) {
  /*
  Send the Email with Password...
  */
  
  var message = '';
  var recipients = 
  'derik.ng@gobaci.com,' 
  + newHire.emailAddress + ','
  + newHire.supervisorEmail + ',' 
  + newHire.recipients;
  
  var subject = "Welcome to BACI, Google Account for: " + newHire.name;
  MailApp.sendEmail(recipients, subject, message, options);
  
}

function createSQLQuery(newHire) {
  /*
  SQL Stuff for other Services
  */
  
}

/** Helper functions **/

function nameToEmail(name){
  var names = name.split(' ');
  var email = names[0].toLowerCase() + '.' + names[1].toLowerCase() + '@gobaci.com'
  return email; 
}

function findRows() {
  range = SpreadsheetApp.getActiveSheet().getLastRow();
  return range
}

function generatePassword()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    for( var i=0; i < 8; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    Logger.log(text);
    return text;
}


/** Main Function to run.. **/

function main() {
  /**
  
  Take in all rows in entry spread sheet and process each row into a New Hire object (see Documentation)
  
  For each New Hire:
  1. Send a New Hire Email 
  2. Create Google Apps Account 
  3. Send Email regarding Google Apps Account 
  4. Generate SQL for infoHR injection
  
  **/
  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
  var entries = spreadSheet.getSheetByName('Entries');
  var processed = spreadSheet.getSheetByName('Processed');
 
  var startRow = 2;  // First row of data to process
  var numRows = findRows() - 1;   // Number of rows to process
  Logger.log('number of rows to process ' + numRows);
  var dataRange = entries.getRange(startRow, 1, numRows, 15)
  // Fetch values for each row in the Range.
  var data = dataRange.getValues();
  //for each entry...
  for (i in data) {
    //create the newhire object
    var newHire = createNewHireObject(data[i]);
    
    //1. Send the new hire email
    sendInternalEmail(newHire);
    
    //move the entry row to processed
    var sourceRow = [];
    sourceRow.push(data[i])
    var targetRange = processed.getRange(processed.getLastRow()+1, 1, 1, 15);
    targetRange.setValues(sourceRow);
    
    //2. Create Google Apps Account
    createGoogleAccount(newHire);
    
    //3. Send Email on Google Accounts
    sendExternalEmail(newHire);
  }
  
  //Clear Entires Sheet after finish processing
  dataRange.clearContent();
}


/** Side Bar Documentation and UI Stuff
**/

function onOpen() {
  showSidebar()
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .createMenu('Documentation')
      .addItem('Show Docs', 'showSidebar')
      .addToUi();
}

function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Docs')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Documentation')
      .setWidth(300);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showSidebar(html);
}