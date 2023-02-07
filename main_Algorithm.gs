let arrToSet = []; // массив с собранными шаблонами


function mainAlgorithm(sheetName = "2023-04") {
  const sheet = mainSpSheet.getSheetByName(sheetName);
  const dataTemlate = sheet.getRange(daysRange).getValues(); //данные из таблицы Дэйс
  const dataTemlateDtataValidations = sheet.getRange(daysRange).getDataValidations();
  const presetation = sheet.getRange(presetationRange).getValues(); //Массив с настройками
  const dayOfMonthNumberVals = sheet.getRange(dayOfMonthNumbersRange).getValues(); //Массив с номером дня месяца
  const arrOfDayasOfWeek = getDaysOfWeekArray(sheetName); // массив с днями недели
  let arrRes = getFirstLevelArrTemplates(sheetName, dataTemlate, presetation, arrOfDayasOfWeek, dataTemlateDtataValidations) //первично обработанный массив с шаблонами
  const [arrTemplates, arrTemplatesDataValidations] = arrRes;
  let dayOfMonthNumber = dayOfMonthNumberVals[0].map(date => {
    return Utilities.formatDate(new Date(date), SpreadsheetApp.getActive().getSpreadsheetTimeZone(), "d");
  }); //Массив с номером дня месяца
  const numDaysOfMonth = getNumDaysOfMonth(sheetName);

  /*Вторая часть функции - формирование массива для итоговой записи в таблицу */
  let res = getFulldataToSet(arrTemplates, presetation, arrOfDayasOfWeek, numDaysOfMonth, arrTemplatesDataValidations);
  Logger.log("res")
  Logger.log(res)
  return res;
}


async function getFulldataToSet(arrTemplates = [], presetation, arrOfDayasOfWeek = [], numDaysOfMonth,arrTemplatesDataValidations) {
  try {
    for (let i = 0; i < arrTemplates.length; i++) {
      let repeatFormula = presetation[i][4];
      let reverse = presetation[i][3];
      let whichDays = presetation[i][0];
      const reg = new RegExp('\\d', 'gm');
      const arrRepitWeek = repeatFormula.toString().match(reg);
      let testArr = new Array(arrOfDayasOfWeek.length - 1).fill("");

      if (repeatFormula == "Monthly") {
        

        
        let newArr = [];
        
        if (whichDays == "Everyday" || whichDays == "") {
          let countDaysAvailibleToFill = arrOfDayasOfWeek.length;
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;
          let arrDataTmpr = [];
          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              Logger.log(s)
              if (countDaysAvailibleToFill > dataInCellsFull) {
                newArr[s] = arrTemplates[i][s];
                if(arrTemplates[i][s] != '') {dataInCellsFull-- };
                countDaysAvailibleToFill--;
                

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(0,s).filter(item => item != "");
                newArr[s] = arrDataTmpr.pop();
                countDaysAvailibleToFill--;
                
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                  Logger.log("arrDataTmpr.length == 0")
                  Logger.log("S: "+ s + "; arrDataTmpr: " + arrDataTmpr)
                }else{
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                  Logger.log("ELSE !! arrDataTmpr.length == 0")
                  Logger.log("S: "+ s + "; arrDataTmpr: " + arrDataTmpr)
                }
              }
            }
            Logger.log("newArr " + newArr)
            Logger.log(newArr.length)
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                  newArr[s] = arrTemplates[i][s];
                  if(arrTemplates[i][s] != '') {dataInCellsFull-- };
                  countDaysAvailibleToFill--;
              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(s).filter(item => item != "");
                newArr[s] = arrDataTmpr.shift();
                countDaysAvailibleToFill--;
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                }else{
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                }
              }
            }

          }
          arrToSet.push(newArr);

        } else if (whichDays == "Workdays") {

          let countDaysAvailibleToFill = arrOfDayasOfWeek.filter(item => (item != 0 && item != 6)).length;
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;

          let arrDataTmpr = [];
          let offset = 0;
          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrTemplates[i][s + offset];
                  if (arrTemplates[i][s + offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(0, s + offset).filter(item => item != "");
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                }
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              }
            }
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              // Logger.log("arrOfDayasOfWeek.length: "+ arrOfDayasOfWeek.length)
              // Logger.log("countDaysAvailibleToFill: " + countDaysAvailibleToFill + ". dataInCellsFull: " + dataInCellsFull+ ". s: " + s)
              // Logger.log("arrTemplates[i][s - offset]: " + arrTemplates[i][s - offset] + ". newArr[s]: " + newArr)
              // Logger.log(countDaysAvailibleToFill > dataInCellsFull)
              // Logger.log("arrDataTmpr > " +  arrDataTmpr);
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrTemplates[i][s - offset];
                  if (arrTemplates[i][s - offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(s - offset).filter(item => item != "");
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                }
                if (arrOfDayasOfWeek[s] != 0 && arrOfDayasOfWeek[s] != 6) {
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              }
            }

          }
          arrToSet.push(newArr);

        } else if (whichDays == "Weekends") {
          let countDaysAvailibleToFill = arrOfDayasOfWeek.filter(item => (item == 0 || item == 6)).length;
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;

          let arrDataTmpr = [];
          let offset = 0;
          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrTemplates[i][s + offset];
                  if (arrTemplates[i][s + offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(0, s + offset).filter(item => item != "");
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                }
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              }
            }
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              // Logger.log("arrOfDayasOfWeek.length: "+ arrOfDayasOfWeek.length)
              // Logger.log("countDaysAvailibleToFill: " + countDaysAvailibleToFill + ". dataInCellsFull: " + dataInCellsFull+ ". s: " + s)
              // Logger.log("arrTemplates[i][s - offset]: " + arrTemplates[i][s - offset] + ". newArr[s]: " + newArr)
              // Logger.log(countDaysAvailibleToFill > dataInCellsFull)
              // Logger.log("arrDataTmpr > " +  arrDataTmpr);
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrTemplates[i][s - offset];
                  if (arrTemplates[i][s - offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(s - offset).filter(item => item != "");
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                }
                if (arrOfDayasOfWeek[s] == 0 || arrOfDayasOfWeek[s] == 6) {
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              }
            }

          }
          arrToSet.push(newArr);

        } else if (whichDays == "Skip Sunday") {

          let countDaysAvailibleToFill = arrOfDayasOfWeek.filter(item => (item != 0)).length;
          let dataInCellsFull = arrTemplates[i].filter(item => item != "").length;

          let arrDataTmpr = [];
          let offset = 0;
          if (reverse) {
            arrTemplates[i] = arrTemplates[i].reverse();
            for (let s = arrOfDayasOfWeek.length - 1; s >= 0; s--) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrTemplates[i][s + offset];
                  if (arrTemplates[i][s + offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(0, s + offset).filter(item => item != "");
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                }
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.pop();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              }
            }
          } else {
            for (let s = 0; s < arrOfDayasOfWeek.length; s++) {
              if (countDaysAvailibleToFill > dataInCellsFull) {
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrTemplates[i][s - offset];
                  if (arrTemplates[i][s - offset] != "") { dataInCellsFull--; }
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                  offset++;
                }

              } else if (countDaysAvailibleToFill == dataInCellsFull) {
                arrDataTmpr = arrTemplates[i].slice(s - offset).filter(item => item != "");
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              } else {
                if (arrDataTmpr.length == 0) { //если список в последнем условии пуст, значит ячеек для заполнения меньше, чем есть данных. Значит пропускаются все условия и попадаем в этот елс. Значит берем только непустые значения из массива шаблона и вставляем сколько есть места
                  arrDataTmpr = arrTemplates[i].filter(item => item != "");
                }
                if (arrOfDayasOfWeek[s] != 0) {
                  newArr[s] = arrDataTmpr.shift();
                  countDaysAvailibleToFill--;
                } else {
                  newArr[s] = "";
                }
              }
            }

          }
          arrToSet.push(newArr);


        }

        Logger.log("arrTemplates[i]")
        Logger.log(arrTemplates[i])
        //arrToSet.push(arrTemplates[i]);
      }

      if (repeatFormula.toString().startsWith("Weekly")) {
        if (arrRepitWeek == null) {
          if (whichDays == "Everyday" || whichDays == "") {
            getWeekEveryday(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse);
          }
          if (whichDays == "Workdays") {
            getWeekWorkDays(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse);
          }
          if (whichDays == "Weekends") {
            getWeekWeekends(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse);
          }
          if (whichDays == "Skip Sunday") {
            getWeekSkipSunday(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse);
          }
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
function getFirstLevelArrTemplates(sheetName, dataTemlate, presetation, arrOfDayasOfWeek, dataTemlateDtataValidations) {
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
        arrResTemplate.push(dataTemlate[i].slice(0, 5));
        arrResTemplateDataValidations.push(dataTemlateDtataValidations[i].slice(0, 5));
      }
      if (whichDays == "Weekends") {
        arrResTemplate.push(dataTemlate[i].slice(5, 7));
        arrResTemplateDataValidations.push(dataTemlateDtataValidations[i].slice(5, 7));
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








