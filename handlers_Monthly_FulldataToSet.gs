function getMontlyEveryday(arrTemplates, arrTemplatesDataValidations, dif = 0, reverse, s) {
  let arrDataTmpr = [];
  let arrDataTmprDataValidations = [];
  Logger.log("ITTTT  arrTemplates")
  Logger.log(arrTemplates)
  Logger.log("ITTTT arrTemplatesDataValidations")
  Logger.log(arrTemplatesDataValidations)
  if(reverse) {
    arrTemplates = arrTemplates.slice(0, dif);
    arrTemplatesDataValidations = arrTemplatesDataValidations.slice(0, dif);
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
  Logger.log("ITTTT  arrDataTmpr")
  Logger.log(arrDataTmpr)
  Logger.log("ITTTT arrDataTmprDataValidations")
  Logger.log(arrDataTmprDataValidations)
  return [arrDataTmpr, arrDataTmprDataValidations];
}
