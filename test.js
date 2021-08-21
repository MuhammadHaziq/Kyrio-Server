// make input array unique
// const input = [1,2,3,3,3,3,4,4]
// const input = [2,1,2,1,2,2,1]
// const output = [1,2,3,4]


const uniqueNum = (input) => {
    let uniNum = [];
var lastValue = ''
input.map(num => {
    if(!input.includes(lastValue)){
        uniNum.push(num)
    }
    lastValue = num
})
console.log(uniNum)
return uniNum
}
console.log(uniqueNum)
// uniqueNum([1,2,3,3,3,3,4,4])
uniqueNum([2,1,2,1,2,2,1])