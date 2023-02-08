function getMontlyEveryday(arrTemplates, arrTemplatesDataValidations, dif = 0, reverse, s) {
  let arrDataTmpr = [];
  let arrDataTmprDataValidations = [];
  if(reverse) {
    arrTemplates = arrTemplates.slice(0, dif);
    arrTemplatesDataValidations = arrTemplatesDataValidations.slice(0, dif);
  }else{
    arrTemplates = arrTemplates.slice(s+1);
    arrTemplatesDataValidations = arrTemplatesDataValidations.slice(s+1);
  }
  let counter = 0;
  for(let i = 0; i < arrTemplates.length; i++) {
    if(arrTemplates[i] != "") { 
        arrDataTmpr[counter] = arrTemplates[i];
        arrDataTmprDataValidations[counter] = arrTemplatesDataValidations[i];
        counter++;
      }
  }
  return [arrDataTmpr, arrDataTmprDataValidations];
}
