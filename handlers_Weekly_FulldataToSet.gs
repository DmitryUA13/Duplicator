function getWeekEveryday(arrToSet, arrOfDayasOfWeek, arrTemplates, reverse, arrTemplatesDataValidations, whichDays) {
  arrOfDayasOfWeek = arrOfDayasOfWeek.map(item => {
    return item == 0 ? 7 : item;
  })
  if (reverse) {
    [arrTemplates, arrTemplatesDataValidations] = getReversedTemplates(whichDays, arrTemplates, arrTemplatesDataValidations)
  }
  let newArr = arrOfDayasOfWeek.map(item => {
    return arrTemplates[item - 1];
  })
  let newArrDataValidations = arrOfDayasOfWeek.map(item => {
    return arrTemplatesDataValidations[item - 1];
  })

  return [newArr, newArrDataValidations];
}


/**
 * Функция возвращает массивы РЕВЕРСОВ шаблонов Данных и Валидации Данных
 */
function getReversedTemplates(whichDays, arrTemplates, arrTemplatesDataValidations) {
  let arrTmpl = [];
  let arrTmplDatavalidations = [];
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
  return [arrTemplates, arrTemplatesDataValidations];
}

/**
 * Функция возвращает индексы с выбранными понедельниками Weekly 1/3 или 2/4 или 1 и т.п.
 */
function getReversedIndexsesStartWeek(arrOfDayasOfWeek, arrRepitWeek, reverse) {
  let arrIndexesRes = [];
  let resfindedIndexes = [];
  let findedIndexes = getArrIndexes(findIndex = 1, arrOfDayasOfWeek);

  reverse ? findedIndexes.reverse() : findedIndexes;
  findedIndexes.filter((item, index) => {
    let difference = (arrOfDayasOfWeek.length - item) / 7 > 1 ? true : false;
    if (difference) {
      resfindedIndexes.push(item);
    }
  })
  for (let s = 0; s < arrRepitWeek.length; s++) {
    resfindedIndexes.filter((item, index) => {
      if (index == arrRepitWeek[s] - 1) {
        return arrIndexesRes.push(item);;
      }
    })

  }
  
  return arrIndexesRes;
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

