/*
*The function receives user selection data - month and year
*Performs a completeness check on the data and creates a new sheet.
*The sheet name contains YYYY-MM.
*If the sheet already exists - creates a new sheet and adds an increment to it on the right
*Each sheet is inserted in order: from left to right - from largest to smallest
*/
function addSheet(formObjectObj = {month: "2023-02"}) {
  let sheetName = '';
  try{
    if(formObjectObj.month === null || formObjectObj.month == ''){
      Browser.msgBox('Please select a month!');
    }else{
      const formObject = formObjectObj.month;
      /*
      findedSheet - We are looking for whether there is already a sheet with a title containing the input string
       */
        let findedSheet = mainSpSheet.getSheets().find(item => item.getName().startsWith(formObject));
        if(findedSheet != null ||findedSheet != undefined){
          let findedSheetIsAlreadyHas = mainSpSheet.getSheets().filter((item) => {
          return item.getName().startsWith(formObject);
          });
          let postfix = Number(findedSheetIsAlreadyHas[findedSheetIsAlreadyHas.length-1].getName().substring(8));
          if(postfix >= 0){ //If there is a match, then we check if there are prefixes after the month
              //If there is, then we compose a new sheet name with the next prefix in order.
              //If not, then add 1 to the prefix
              sheetName = `${formObject} ${postfix+1}`
              addAndPlaceNewSheet(sheetName, findedSheetIsAlreadyHas[findedSheetIsAlreadyHas.length-1].getIndex()+1, formObject);
              return sheetName; 
            }
        }else{
          //If not, then add a new sheet with the name without a prefix and find a place to insert it between the largest and smallest already existing sheet by month number
          //If no duplicates have been created yet, then the first duplicate will be located to the right of the "Template" Sheet
          let arrSheetsToFindPlace = mainSpSheet.getSheets();
          const dateOfFormObject = new Date(formObject);
          let findedIndex;
          
          arrSheetsToFindPlace = arrSheetsToFindPlace.filter(item => {
            return item.getName().startsWith("20");
          })
          
          let dateInItem = '';
          findedSheet = arrSheetsToFindPlace.filter((item, index) => {
            dateInItem = new Date(item.getName().substring(0,7));
            if(dateOfFormObject < dateInItem){
                return item;
            }else if(index+1 == arrSheetsToFindPlace.length){
                findedIndex = item.getIndex()+1;
            }
          })
          if(findedSheet[0] != undefined) {
            findedIndex = findedSheet[0].getIndex();
            
          }else if(findedIndex == -1 || findedIndex === undefined){
            findedIndex = mainSpSheet.getSheetByName(template).getIndex()+1;
          }
          sheetName = `${formObject}`;
          dataTemlate = addAndPlaceNewSheet(sheetName, findedIndex, formObject); 
        return sheetName;  
        }
    }
  }catch(e){
  }
}
 /*The function creates a duplicate and moves the sheet to the location determined by the sorting algorithm*/
function addAndPlaceNewSheet(sheetName, findedSheetIndex, formObject){
    let newSheet = mainSpSheet.getSheetByName(template).copyTo(mainSpSheet);
    newSheet.setName(sheetName);
    mainSpSheet.setActiveSheet(mainSpSheet.getSheets()[mainSpSheet.getSheets().length-1]);
    mainSpSheet.moveActiveSheet(findedSheetIndex);//Move a sheet to a specific index
    newSheet.getRange(monthCell).setValue(formObject);// set Date 
}






