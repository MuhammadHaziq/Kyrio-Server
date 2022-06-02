// make input array unique
// const input = [1,2,3,3,3,3,4,4]
// const input = [2,1,2,1,2,2,1]
// const output = [1,2,3,4]


// const uniqueNum = (input) => {
//     let uniNum = [];
// var lastValue = ''
// input.map(num => {
//     if(!input.includes(lastValue)){
//         uniNum.push(num)
//     }
//     lastValue = num
// })
// console.log(uniNum)
// return uniNum
// }
// console.log(uniqueNum)
// // uniqueNum([1,2,3,3,3,3,4,4])
// uniqueNum([2,1,2,1,2,2,1])


// const calculateSalary = (salary, YearsToCalculate) => {
//     let increment = 0.10;
//     let basic = 0.75;
//     let allownce = 0.25;
//     let currentSalary = salary;
//     let Bonus = 0;
//     for(let i = 0; i < YearsToCalculate; i++){
//         let year = i + 1;
//         Bonus = parseInt(Bonus) + parseInt(currentSalary)
//         let BasicSalary = parseInt(currentSalary * basic)
//         let Allownce = parseInt(currentSalary * allownce)
//         let IncrementedSalary = parseInt(BasicSalary * increment)

//         console.log("Year: "+year);
//         console.log("Gross Salary: "+currentSalary);
//         console.log("Basic Salary: "+BasicSalary);
//         console.log("Allownce: "+Allownce);
//         console.log("Increment: "+IncrementedSalary);
        
//         currentSalary = parseInt(currentSalary) + parseInt(IncrementedSalary)
//     }
//     console.log("Total Bonus: "+Bonus);
// }

// calculateSalary(110000,10);


// var dbUri = "mongodb://localhost:27017/kyrio_pos_v2";

// var basePath = "D:/Mongo Dump/30_05_2022";
// var Backup = require("backup-mongodb");

// new Backup(dbUri, basePath).backup();

const restore = require('mongodb-restore-dump'),
      uri = 'mongodb://localhost:27017/staging_kyrio_pos_v2';
// restore single database
const handleAction = async () => {
    await restore.database({
    uri,
    database: 'staging_kyrio_pos_v2',
    from: 'D:/Mongo Dump/30_05_2022/kyrio_pos_v2_30_5_22.13.40.52/'
});
}
handleAction()
//optionally you can call new Backup(dbUri, basePath).backup(done);
//where done is the callback to be called when done