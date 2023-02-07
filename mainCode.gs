const sprSheetId = "1aRvc9y3ci4gt6ErAg4yjHbnzp-qC049WdtbI5o61aJg" //Worksheet ID
const template = 'Template';//Sheet title Template
const daysRange = "L4:AP"; //Range with data under dates
const monthCell = "L1"; //Cell with main date
const presetationRange = "G4:K"; //Range with Settings
const numberAndDaysInDuplRange = "L3:AP3"; //the range with dates (numbers and days of  week);
const mainSpSheet = SpreadsheetApp.openById(sprSheetId);//The table itself
const sheetTemp = mainSpSheet.getSheetByName(template);//Page Template
const dayOfMonthNumbersRange = "L2:AP2"; 

/*
*scScScScsc
*/


function mainFn(formObjectObj) {
    const resAddSheetName = addSheet(formObjectObj); //if !underfined, the sheet has been created And the name of the sheet is stored in the variable (resAddSheet)
    let duplicatedSheet = mainSpSheet.getSheetByName(resAddSheetName);
    let trueRes = mainAlgorithm(resAddSheetName);
    trueRes.then(trueRes => {
        try{
            duplicatedSheet.getRange(4,12, trueRes.length, 40 ).clearContent().clearDataValidations();
            for(let i =0; i < trueRes.length; i++ ) {
              let endArr = [trueRes[i]]; 
              duplicatedSheet.getRange(i+4, 12, 1, trueRes[i].length).setValues(endArr);
            }
        duplicatedSheet.hideColumns(7, 5);
        if((31 - getNumDaysOfMonth(resAddSheetName)) == 0) {
            
        }else{
            duplicatedSheet.hideColumns(getNumDaysOfMonth(resAddSheetName)+12, (31 - getNumDaysOfMonth(resAddSheetName)));
        }
        duplicatedSheet.getRange("L4:AP").setBackground("white").setFontColor("black");
        duplicatedSheet.activate();        
                
            }catch(e) {
              Logger.log("Errror:::  "+e)
            }
    })
}
    
/*
*Call popup to select the date of Duplication
*/
function getDataToDuplicate() {
  
  const ui = SpreadsheetApp.getUi();
  const htmlOutput = HtmlService
                        .createHtmlOutputFromFile('startForm.html')
                        .setTitle('Select the month you want to duplicate!)')
                        .setWidth(250)
                        .setHeight(300);
  ui.showDialog(htmlOutput);
}
