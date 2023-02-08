function getWeekEveryday(arrToSet, arrOfDayasOfWeek, arrTemplates, reverse, arrTemplatesDataValidations, whichDays) {
  let arrTmpl = [];
  let arrTmplDatavalidations = [];
  arrOfDayasOfWeek = arrOfDayasOfWeek.map(item => {
    return item == 0 ? 7 : item;
  })
  if (reverse) {
    if (whichDays == "Everyday") {
      arrTemplates = arrTemplates.reverse();
      arrTemplatesDataValidations = arrTemplatesDataValidations.reverse();

    } else {
      let counter = 0;
      for (let d = 0; d < arrTemplates.length; d++) {
        if (arrTemplates[d] != '') {
          arrTmpl[counter] = arrTemplates[d];
          arrTmplDatavalidations[counter] = arrTemplatesDataValidations[d]
          counter++;
        };
      }
      if (whichDays == "Workdays") {
        arrTemplates = [...arrTmpl.reverse(), "", ""];
        arrTemplatesDataValidations = [...arrTmplDatavalidations.reverse(), "", ""];
      }
      if (whichDays == "Weekends") {
        arrTemplates = ["", "", "", "", "", ...arrTmpl.reverse()];
        arrTemplatesDataValidations = ["", "", "", "", "", ...arrTmplDatavalidations.reverse()];
      }
      if (whichDays == "Skip Sunday") {
      arrTemplates = [...arrTmpl.reverse(), ""];
      arrTemplatesDataValidations = [...arrTmplDatavalidations.reverse(), ""];
      }
    }
  }
  let newArr = arrOfDayasOfWeek.map(item => {
    return arrTemplates[item - 1];
  })
  let newArrDataValidations = arrOfDayasOfWeek.map(item => {
    return arrTemplatesDataValidations[item - 1];
  })
  return [newArr, newArrDataValidations];
}

function getWeekWeekends(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse) {
  if (reverse) {
    arrTemplates[i] = arrTemplates[i].reverse();
  }
  let res = arrOfDayasOfWeek.map(item => {
    if (item == 0) {
      // Logger.log(arrTemplates[i])
      return arrTemplates[i][1].valueOf();
    } else if (item == 6) {
      // Logger.log(arrTemplates[i])
      return arrTemplates[i][0].valueOf();
    } else {
      return "";
    }
  })
  arrToSet.push(res);
}

function getWeekWorkDays(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse) {
  if (reverse) {
    arrTemplates[i] = arrTemplates[i].reverse();
  }
  let res = arrOfDayasOfWeek.map(item => {
    if (item >= 1 && item <= 5) {
      return arrTemplates[i][item - 1].valueOf();
    } else {
      return "";
    }
  })
  arrToSet.push(res);
}

function getWeekSkipSunday(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse) {
  if (reverse) {
    arrTemplates[i] = arrTemplates[i].reverse();
  }
  let res = arrOfDayasOfWeek.map(item => {
    if (item == 6) {
      return "";
    } else if (item == 0) {
      return arrTemplates[i][6].valueOf();
    } else {
      return arrTemplates[i][item - 1].valueOf();
    }
  })
  arrToSet.push(res);
}




function getInd(order, arrOfDayasOfWeek) {
  let counter = 0;
  let ind = -1;
  arrOfDayasOfWeek.filter((item, index) => {
    if (item == 1) {
      counter++;
      if (counter == order) {
        ind = index;
      }
    }
  });
  return ind
}



function getArrIndexes(findIndex, arrOfDayasOfWeek) {
  let indArr = [];
  arrOfDayasOfWeek.filter((item, index) => {
    if (item == findIndex) {
      indArr.push(index);
    }
  })
  return indArr; // возвращает массив с искомыми индексами дней в массиве дней месяца
}

