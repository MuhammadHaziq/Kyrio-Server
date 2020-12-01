const numbers = [1, 2, 3, 4, 5, 6, 6, 7, 8, 8, 5];

function checkDublicate () {
    // let lastIndex
    // let newArray = [];
    // return numbers.map((itm,index)=>{
    //     if(index !== 0){
    //         let lastValue = numbers[index-1]
    //         let CurrentVal = itm
    //         if(lastValue !== CurrentVal){
    //             return newArray.push(itm)
    //         }
    //     } else {
    //         return newArray.push(itm)
    //     }
    // })
    return numbers.filter((itm,index)=>{
        let lastVal;
        if(lastVal !== itm){
            return itm
        }
         lastVal = itm
    })
}

console.log(checkDublicate());