function getWeekEveryday(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse) {
    if(reverse){
          arrTemplates[i] =  arrTemplates[i].reverse();
      }
    let res = arrOfDayasOfWeek.map(item => {
        if(item > 0 && item <=6){
              return arrTemplates[i][item-1].valueOf();
        }else{
              return arrTemplates[i][6].valueOf();
        }
    })
    arrToSet.push(res);
}

function getWeekWeekends(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse) {
  if(reverse){
          arrTemplates[i] =  arrTemplates[i].reverse();
      }
    let res =  arrOfDayasOfWeek.map(item => {
        if(item == 0) {
          // Logger.log(arrTemplates[i])
          return arrTemplates[i][1].valueOf();
        }else if(item == 6){
          // Logger.log(arrTemplates[i])
          return arrTemplates[i][0].valueOf();
        }else{
          return"";
        }
    })
    arrToSet.push(res);
}

function getWeekWorkDays(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse) {
  if(reverse){
          arrTemplates[i] =  arrTemplates[i].reverse();
      }
    let res = arrOfDayasOfWeek.map(item=> {
          if(item >= 1 && item <= 5) {
            return arrTemplates[i][item-1].valueOf();
          }else{
            return "";
          }
        })
        arrToSet.push(res);
}

function getWeekSkipSunday(arrToSet, arrOfDayasOfWeek, arrTemplates, i, reverse) {
  if(reverse){
          arrTemplates[i] =  arrTemplates[i].reverse();
      }
    let res =  arrOfDayasOfWeek.map(item => {
        if(item == 6) {
          return"";
        }else if(item == 0){
          return arrTemplates[i][6].valueOf();
        }else {
          return arrTemplates[i][item - 1].valueOf();
        }
    })
    arrToSet.push(res);
}




function getInd(order, arrOfDayasOfWeek){
            let counter = 0;
            let ind = -1;
            arrOfDayasOfWeek.filter((item, index) => {
                if (item == 1){
                  counter++;
                  if(counter == order){
                      ind = index;
                  }
                } 
          });
          return ind
        }



function getArrIndexes(findIndex ,arrOfDayasOfWeek ) {
    let indArr = [];
      arrOfDayasOfWeek.filter((item, index) => {
      if(item == findIndex){
          indArr.push(index);
      }
    })
    return indArr; // возвращает массив с искомыми индексами дней в массиве дней месяца
}        

                    