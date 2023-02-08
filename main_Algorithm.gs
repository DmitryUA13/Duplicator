

function mainAlgorithm(sheetName = "2023-04") {
  const sheet = mainSpSheet.getSheetByName(sheetName);
  const dataTemlate = sheet.getRange(daysRange).getValues(); //данные из таблицы Дэйс
  const dataTemlateDtataValidations = sheet.getRange(daysRange).getDataValidations();
  const presetation = sheet.getRange(presetationRange).getValues(); //Массив с настройками
  const dayOfMonthNumberVals = sheet.getRange(dayOfMonthNumbersRange).getValues(); //Массив с номером дня месяца
  const arrOfDayasOfWeek = getDaysOfWeekArray(sheetName); // массив с днями недели
  let arrRes = getFirstLevelArrTemplates(sheetName, dataTemlate, presetation, dataTemlateDtataValidations) //первично обработанный массив с шаблонами
  const [arrTemplates, arrTemplatesDataValidations] = arrRes;
  let dayOfMonthNumber = dayOfMonthNumberVals[0].map(date => {
    return Utilities.formatDate(new Date(date), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "d");
  }); //Массив с номером дня месяца
  const numDaysOfMonth = getNumDaysOfMonth(sheetName);

  /*Вторая часть функции - формирование массива для итоговой записи в таблицу */
  let res = getFulldataToSet(arrTemplates, presetation, arrOfDayasOfWeek, numDaysOfMonth, arrTemplatesDataValidations);
  // Logger.log("res")
  // Logger.log(res)
  return res;
}


async function getFulldataToSet(arrTemplates = [], presetation, arrOfDayasOfWeek = [], numDaysOfMonth, arrTemplatesDataValidations) {
  try {
    let arrToSet = []; // массив с собранными шаблонами
    let arrToSetDataValidations = [];

    for (let i = 0; i < arrTemplates.length; i++) {
      let newArr = [];
      let newArrDataValidations = [];
      let arrDataTmpr = [];
      let arrDataTmprDataValidations = [];
      let repeatFormula = presetation[i][4];
      let reverse = presetation[i][3];
      let whichDays = presetation[i][0];
      const reg = new RegExp('\\d', 'gm');
      const arrRepitWeek = repeatFormula.toString().match(reg);
      let testArr = new Array(arrOfDayasOfWeek.length - 1).fill("");


      if (repeatFormula == "Monthly") {
        let difference = arrTemplates[i].length - arrOfDayasOfWeek.length;

        if (whichDays == "Everyday" || whichDays == "") {
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;
          let countDaysAvailibleToFill = arrOfDayasOfWeek.length;

          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            arrTemplatesDataValidations[i] = arrTemplatesDataValidations[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                newArr[s] = arrTemplates[i][s + difference];
                newArrDataValidations[s] = arrTemplatesDataValidations[i][s + difference];
                if (arrTemplates[i][s + difference] != '') { dataInCellsFull-- };
                countDaysAvailibleToFill--;
              } else if (countDaysAvailibleToFill == dataInCellsFull && arrDataTmpr.length == 0) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference, reverse, s);
                newArr[s] = arrDataTmpr.pop();
                newArrDataValidations[s] = arrDataTmprDataValidations.pop();

              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference, reverse, s);
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrDataTmprDataValidations.pop();
                } else {
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrDataTmprDataValidations.pop();
                }
              }
            }
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                newArr[s] = arrTemplates[i][s];
                newArrDataValidations[s] = arrTemplatesDataValidations[i][s + difference];
                if (arrTemplates[i][s] != '') { dataInCellsFull-- };
                countDaysAvailibleToFill--;
              } else if (countDaysAvailibleToFill == dataInCellsFull && arrDataTmpr.length == 0) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference, reverse, s);
                newArr[s] = arrDataTmpr.shift();
                newArrDataValidations[s] = arrDataTmprDataValidations.shift();
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference, reverse, s);
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrDataTmprDataValidations.shift();
                } else {
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrDataTmprDataValidations.shift();
                }
              }
            }
          }

        } else if (whichDays == "Workdays") {

          let countDaysAvailibleToFill = arrOfDayasOfWeek.filter(item => (item != 0 && item != 6)).length;
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;

          let arrDataTmpr = [];
          let offset = 0;
          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            arrTemplatesDataValidations[i] = arrTemplatesDataValidations[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrTemplates[i][s + difference + offset];
                  newArrDataValidations[s] = arrTemplatesDataValidations[i][s + difference + offset];
                  if (arrTemplates[i][s + offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference + offset + 1, reverse, s);
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6 && arrDataTmpr.length == 0) {
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrTemplatesDataValidations[i].pop();
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              } else {
                if (arrDataTmpr.length == 0) {
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference + offset + 1, reverse, s);
                }
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrTemplatesDataValidations[i].pop();
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              }
            }
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrTemplates[i][s - offset];
                  newArrDataValidations[s] = arrTemplatesDataValidations[i][s - offset];
                  if (arrTemplates[i][s - offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull && arrDataTmpr.length == 0) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s - offset, reverse, s);
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrTemplatesDataValidations[i].shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              } else {
                if (arrDataTmpr.length == 0) {
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s - offset, reverse, s);
                }
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrTemplatesDataValidations[i].shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              }
            }

          }

        } else if (whichDays == "Weekends") {
          let countDaysAvailibleToFill = arrOfDayasOfWeek.filter(item => (item == 0 || item == 6)).length;
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;

          let arrDataTmpr = [];
          let offset = 0;
          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            arrTemplatesDataValidations[i] = arrTemplatesDataValidations[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrTemplates[i][s + difference + offset];
                  newArrDataValidations[s] = arrTemplatesDataValidations[i][s + difference + offset];
                  if (arrTemplates[i][s + offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull && arrDataTmpr.length == 0) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference + offset + 1, reverse, s);
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrDataTmprDataValidations.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              } else {
                if (arrDataTmpr.length == 0) {
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference + offset + 1, reverse, s);
                }
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrDataTmprDataValidations.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              }
            }
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrTemplates[i][s - offset];
                  newArrDataValidations[s] = arrTemplatesDataValidations[i][s - offset];
                  if (arrTemplates[i][s - offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull && arrDataTmpr.length == 0) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s - offset, reverse, s);
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrDataTmprDataValidations.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              } else {
                if (arrDataTmpr.length == 0) {
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s - offset, reverse, s);
                }
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrDataTmprDataValidations.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              }
            }

          }

        } else if (whichDays == "Skip Sunday") {

          let countDaysAvailibleToFill = arrOfDayasOfWeek.filter(item => (item != 0)).length;
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;

          let arrDataTmpr = [];
          let offset = 0;
          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            arrTemplatesDataValidations[i] = arrTemplatesDataValidations[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrTemplates[i][s + difference + offset];
                  newArrDataValidations[s] = arrTemplatesDataValidations[i][s + difference + offset];
                  if (arrTemplates[i][s + offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull && arrDataTmpr.length == 0) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference + offset + 1, reverse, s);
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrDataTmprDataValidations.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              } else {
                if (arrDataTmpr.length == 0) { 
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s + difference + offset + 1, reverse, s);
                }
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.pop();
                  newArrDataValidations[s] = arrDataTmprDataValidations.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              }
            }
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrTemplates[i][s - offset];
                  newArrDataValidations[s] = arrTemplatesDataValidations[i][s - offset];
                  if (arrTemplates[i][s - offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull && arrDataTmpr.length == 0) {
                [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s - offset, reverse, s);
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrDataTmprDataValidations.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              } else {
                if (arrDataTmpr.length == 0) {
                  [arrDataTmpr, arrDataTmprDataValidations] = getMontlyEveryday(arrTemplates[i], arrTemplatesDataValidations[i], s - offset, reverse, s);
                }
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.shift();
                  newArrDataValidations[s] = arrDataTmprDataValidations.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  newArrDataValidations[s] = null;
                }
              }
            }

          }
        }

        Logger.log(newArrDataValidations)
        arrToSet.push(newArr);
        arrToSetDataValidations.push(newArrDataValidations);
      }

      if (repeatFormula.toString().startsWith("Weekly")) {
        if (arrRepitWeek == null) {
          [newArr ,newArrDataValidations] = getWeekEveryday(arrToSet, arrOfDayasOfWeek, arrTemplates[i], reverse, arrTemplatesDataValidations[i]);
          arrToSet.push(newArr);
          arrToSetDataValidations.push(newArrDataValidations);
        } else if (arrRepitWeek != undefined) {
          let arrIndexesRes = [];
          for (let a = 0; a < arrRepitWeek.length; a++) {
            let indexStartWeek = getInd(arrRepitWeek[a], arrOfDayasOfWeek)
            if (whichDays == "Everyday" || whichDays == "") {
              if (reverse) {
                let findedIndexes = getArrIndexes(findIndex = 1, arrOfDayasOfWeek);
                findedIndexes.reverse();
                findedIndexes.map((item, index) => {
                  let difference = (numDaysOfMonth - item) / 7 > 1 ? true : false;
                  if (!difference) {
                    findedIndexes.shift();
                  } a
                })

                findedIndexes.filter((item, index) => {
                  if (index == arrRepitWeek[a] - 1) {
                    return arrIndexesRes.push(item);;
                  }
                })

                arrIndexesRes.map(item => {
                  arrTemplates[i].map((item, indexTempl) => {
                    if (testArr.length < arrOfDayasOfWeek.length) {
                      testArr[arrIndexesRes[a] + indexTempl] = item;
                    }
                  })
                })
              } else {
                arrTemplates[i].map((item, indexTempl) => {
                  if (testArr.length < arrOfDayasOfWeek.length) {
                    testArr[indexStartWeek + indexTempl] = item;
                  }
                })
              }
            }

            if (whichDays == "Workdays") {
              if (reverse) {
                let findedIndexes = getArrIndexes(findIndex = 1, arrOfDayasOfWeek);
                findedIndexes.reverse();
                findedIndexes.map((item, index) => {
                  let difference = (numDaysOfMonth - item) / 7 > 1 ? true : false;
                  if (!difference) {
                    findedIndexes.shift();
                  } a
                })

                findedIndexes.filter((item, index) => {
                  if (index == arrRepitWeek[a] - 1) {
                    return arrIndexesRes.push(item);;
                  }
                })

                arrIndexesRes.map(item => {
                  let counter = 0;
                  arrTemplates[i].map((item, indexTempl) => {
                    counter++;
                    if (counter <= 5 && testArr.length < arrOfDayasOfWeek.length) {
                      testArr[arrIndexesRes[a] - 1 + indexTempl] = item;
                    }
                  })
                })
              } else {
                let counter = 0;
                arrTemplates[i].map((item, indexTempl) => {
                  counter++;
                  if (counter <= 5 && testArr.length < arrOfDayasOfWeek.length) {
                    testArr[indexStartWeek + indexTempl] = item;
                  }
                })
              }
            }

            if (whichDays == "Weekends") {
              if (reverse) {
                let findedIndexes = getArrIndexes(findIndex = 1, arrOfDayasOfWeek);
                findedIndexes.reverse();
                findedIndexes.map((item, index) => {
                  let difference = (numDaysOfMonth - item) / 7 > 1 ? true : false;
                  if (!difference) {
                    findedIndexes.shift();
                  }
                })

                findedIndexes.filter((item, index) => {
                  if (index == arrRepitWeek[a] - 1) {
                    return arrIndexesRes.push(item);
                  }
                })

                arrIndexesRes.map(item => {
                  isStop = () => {
                    return arrOfDayasOfWeek.length - indexStartWeek > counter ? true : false

                  }
                  let counter = 5;
                  arrTemplates[i].map((item, indexTempl) => {
                    counter++;
                    if (counter <= 7 && testArr.length < arrOfDayasOfWeek.length && isStop()) {
                      testArr[arrIndexesRes[a] - 1 + counter] = item;
                    }
                  })
                })
              } else {
                isStop = () => {
                  return arrOfDayasOfWeek.length - indexStartWeek > counter ? true : false

                }
                let counter = 5;
                arrTemplates[i].map((item, indexTempl) => {
                  counter++;
                  if (counter <= 7 && testArr.length < arrOfDayasOfWeek.length && isStop()) {
                    testArr[indexStartWeek - 1 + counter] = item;
                  }
                })
              }
            }



            if (whichDays == "Skip Sunday") {
              if (reverse) {
                let findedIndexes = getArrIndexes(findIndex = 1, arrOfDayasOfWeek);
                findedIndexes.reverse();
                findedIndexes.map((item, index) => {
                  let difference = (numDaysOfMonth - item) / 7 > 1 ? true : false;
                  if (!difference) {
                    findedIndexes.shift();
                  }
                })

                findedIndexes.filter((item, index) => {
                  if (index == arrRepitWeek[a] - 1) {
                    return arrIndexesRes.push(item);;
                  }
                })

                arrIndexesRes.map(item => {
                  isStop = () => {
                    return arrOfDayasOfWeek.length - indexStartWeek > counter ? true : false;
                  }
                  let counter = 0;
                  arrTemplates[i].map((item, indexTempl) => {
                    counter++;
                    if (counter <= 6 && testArr.length < arrOfDayasOfWeek.length && isStop()) {
                      testArr[arrIndexesRes[a] - 1 + counter] = item;
                    }
                  })
                })
              } else {
                isStop = () => {
                  return arrOfDayasOfWeek.length - indexStartWeek > counter ? true : false;
                }
                let counter = 1;
                arrTemplates[i].map((item, indexTempl) => {
                  if (counter <= 7 && testArr.length < arrOfDayasOfWeek.length && isStop()) {
                    testArr[indexStartWeek - 1 + counter] = item;
                  }
                  counter++;
                })
              }
            }

          }
          arrToSet.push(testArr);
        }
      
      }

      if (repeatFormula.toString().startsWith("Every")) {
        let everyArr = [];
        if (whichDays == "Everyday" || whichDays == "") {

          let counter = 0;
          arrOfDayasOfWeek.map((itemArr, indexArr) => {
            if (testArr.length < arrOfDayasOfWeek.length) {

              arrTemplates[i].map((item, indexTempl) => {
                testArr[counter] = item;
                counter++;
              })
            }
          })
          if (testArr.length > arrOfDayasOfWeek.length) {
            testArr.splice(arrOfDayasOfWeek.length)
          }
        }

        if (whichDays == "Workdays") {
          let counter = 0;
          for (let f = 0; f <= arrOfDayasOfWeek.length - 1; f++) {
            if (arrOfDayasOfWeek[f] >= 1 && arrOfDayasOfWeek[f] <= 5) {
              everyArr.push(arrTemplates[i][counter]);
              if (counter == arrTemplates[i].length - 1) {
                counter = 0;
              } else {
                counter++;
              }
            } else {
              everyArr.push("");
              if (counter == arrTemplates[i].length - 1) {
                counter = 0;
              }
            }
          }

          everyArr.splice(arrOfDayasOfWeek.length);
          testArr = everyArr;
        }

        if (whichDays == "Weekends") {
          let counter = 0;
          for (let f = 0; f <= arrOfDayasOfWeek.length - 1; f++) {
            if (arrOfDayasOfWeek[f] == 0 || arrOfDayasOfWeek[f] == 6) {
              everyArr.push(arrTemplates[i][counter]);
              if (counter == arrTemplates[i].length - 1) {
                counter = 0;
              } else {
                counter++;
              }
            } else {
              everyArr.push("");
              if (counter == arrTemplates[i].length - 1) {
                counter = 0;
              }
            }
          }

          everyArr.splice(arrOfDayasOfWeek.length);
          testArr = everyArr;
        }

        if (whichDays == "Skip Sunday") {
          let counter = 0;
          for (let f = 0; f <= arrOfDayasOfWeek.length - 1; f++) {
            if (arrOfDayasOfWeek[f] != 0) {
              everyArr.push(arrTemplates[i][counter]);
              if (counter == arrTemplates[i].length - 1) {
                counter = 0;
              } else {
                counter++;
              }
            } else {
              everyArr.push("");
              if (counter == arrTemplates[i].length - 1) {
                counter = 0;
              }
            }
          }

          everyArr.splice(arrOfDayasOfWeek.length);
          testArr = everyArr;
        }
        if (testArr.length > arrOfDayasOfWeek.length) {
          testArr.splice(arrOfDayasOfWeek.length)
        }
        arrToSet.push(testArr);
        Logger.log("END OF MONTHLY")
        Logger.log(newArr)
        Logger.log(newArrDataValidations)
        arrToSet.push(newArr);
        arrToSetDataValidations.push(newArrDataValidations);
        Logger.log("END OF MONTHLY arrToSet")
        Logger.log(arrToSet)
        Logger.log(arrToSetDataValidations)
      }
      if (repeatFormula == "") {
        arrToSet.push([""])
      }
    }
    return arrToSet;
  } catch (e) {
    Logger.log(e)
  }
}


/*
*
*
* Функция возвращает массив шаблонов с реверсом значений ( кроме Еженедельно) *
*
*
*/
function getFirstLevelArrTemplates(sheetName, dataTemlate, presetation, dataTemlateDtataValidations) {
  const resArr = [];
  let arrResTemplate = []; // массив с шаблонами. Например, если в настройке указано Еженедельно,
  // то в строке с этим шаблоном хранится только 7 значений и так далее
  let arrResTemplateDataValidations = [];
  const numberDaysOfMonth = getNumDaysOfMonth(sheetName); //количество дней в месяце Дубликате
  const numberDaysOfMonthTemplate = getNumDaysOfMonth(template); //количество дней в месяце Шаблоне
  const regexpForEvery = new RegExp("\\d{1,}", 'gm');
  for (let i = 0; i < presetation.length; i++) {
    let repeatFormula = presetation[i][4];
    let reverse = presetation[i][3];
    let whichDays = presetation[i][0];


    if (repeatFormula == "") {
      arrResTemplate.push([""]);
    }
    if (repeatFormula == "Monthly") {
      let arr = dataTemlate[i].slice(0, 32);
      arrResTemplate.push(arr);
      let arrDataValidations = dataTemlateDtataValidations[i].slice(0, 32);
      arrResTemplateDataValidations.push(arrDataValidations);
    }
    if (repeatFormula.toString().startsWith("Every")) {
      let posEnd = Number(presetation[i][4].toString().match(regexpForEvery)); //Extract the number from the Every "*9*"th expression
      if (reverse) {
        arrResTemplate.push(dataTemlate[i].slice(0, posEnd).reverse());
        arrResTemplateDataValidations.push(dataTemlateDtataValidations[i].slice(0, posEnd).reverse());
      } else {
        arrResTemplate.push(dataTemlate[i].slice(0, posEnd));
        arrResTemplateDataValidations.push(dataTemlateDtataValidations[i].slice(0, posEnd));
      }


    }
    if (repeatFormula.toString().startsWith("Weekly")) {
      if (whichDays == "Everyday" || whichDays == "") {
        arrResTemplate.push(dataTemlate[i].slice(0, 7));
        arrResTemplateDataValidations.push(dataTemlateDtataValidations[i].slice(0, 7));
      } if (whichDays == "Workdays") {
        arrResTemplate.push([...dataTemlate[i].slice(0, 5),"" ,"" ]);
        arrResTemplateDataValidations.push([...dataTemlateDtataValidations[i].slice(0, 5),"","" ]);
      }
      if (whichDays == "Weekends") {
        arrResTemplate.push(["","" ,"" ,"" ,"" , ...dataTemlate[i].slice(5, 7)]);
        arrResTemplateDataValidations.push(["","" ,"" ,"" ,"" , ...dataTemlateDtataValidations[i].slice(5, 7)]);
      }
      if (whichDays == "Skip Sunday") {
        dataTemlate[i][6] = '';
        arrResTemplate.push(dataTemlate[i].slice(0, 7));
        dataTemlateDtataValidations[i][6] = '';
        arrResTemplateDataValidations.push(dataTemlateDtataValidations[i].slice(0, 7));
      }
    }

  }
  resArr.push(arrResTemplate);
  resArr.push(arrResTemplateDataValidations);
  return resArr;
}


/* getNumDaysOfMonth(sheetName);
@param - Name of the new sheet
*returns the number of days in a month
*/
function getNumDaysOfMonth(sheetName) {
  const sheet = mainSpSheet.getSheetByName(sheetName);
  const dateFromMonth = new Date(sheet.getRange(monthCell).getValue());
  const dateNextMonth = new Date(new Date(dateFromMonth.getFullYear(), new Date(dateFromMonth).getMonth() + 1));
  const numberDaysOfMonth = Math.round((dateNextMonth - dateFromMonth) / 1000 / 3600 / 24);
  return numberDaysOfMonth;
}

/* Функция возвращает массив с днями недели по порядку в формате 0, 1, 2 ... Где 0 -воскресенье, 6 - суббота  */
function getDaysOfWeekArray(sheetName) {
  const sheet = mainSpSheet.getSheetByName(sheetName);
  let numberDaysOfMonth = getNumDaysOfMonth(sheetName);
  let arrNumsAndDayOfWeek = sheet.getRange(numberAndDaysInDuplRange).getValues()[0].toString().split("),").splice(0, numberDaysOfMonth);
  let cleanRes = arrNumsAndDayOfWeek.map((item) => {
    return new Date(item).getDay();
  });
  return cleanRes;
}









