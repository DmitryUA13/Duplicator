function getMontlyEveryday(arrTemplates, arrTemplatesDataValidations, dif = 0, reverse, s) {
  let arrDataTmpr = [];
  let arrDataTmprDataValidations = [];
  if(reverse) {
    arrTemplates = arrTemplates.slice(0, dif + 1);
    arrTemplatesDataValidations = arrTemplatesDataValidations.slice(0, dif + 1);
    Logger.log("IN FN arrTemplates")
    Logger.log(arrTemplates)
    Logger.log("IN FN arrTemplates")
    Logger.log(dif)
  }else{
    arrTemplates = arrTemplates.slice(s);
    arrTemplatesDataValidations = arrTemplatesDataValidations.slice(s);
  }
  let counter = 0;
  for(let i = 0; i < arrTemplates.length; i++) {
    if(arrTemplates[i] != "") { 
        arrDataTmpr[counter] = arrTemplates[i];
        arrDataTmprDataValidations[counter] = arrTemplatesDataValidations[i];
        counter++;
      }
  }
  Logger.log("arrDataTmpr")
  Logger.log(arrDataTmpr)
  return [arrDataTmpr, arrDataTmprDataValidations];
}
