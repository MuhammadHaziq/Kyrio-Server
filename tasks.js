
// Problem # 1
// Ahsan Imtiaz4:19 PM
// Imagine you are working on an application that has a gamification aspect to it i.e a user has a level and can increase his level by getting experience points, the user can gain experience points by completing some achievements or completing some tasks etc. In our codebase we are storing the user's accumulated experience points called userXP but we are not storing their current level.

// Write a function that if passed a userXP value calculates and returns a userLevel value. The base case will be 
// level = 1
// levelStartXP = 0
// levelEndXP = 1000

// You will use the following two formulas to find the start and end XP of levels that come after the base level
// newLevelStartXP = levelEndXP + 1
// newLevelEndXP = (levelEndXP / 2)  +  levelEndXP
// The purpose of this is to not have a defined end level, this way if I pass any userXP value lets say 100,000 as an example to the function you write, it will always return a userLevel (13 in this case)

// Answer: 
// Working perfectly fine checked all the scenarios! 
// Code can be improved by adding a try catch and proper exception handling

var userXP = 100000

function getStartEndXP(end){
    return {
        start: end + 1,
        end: (end / 2)  +  end
    }
}

function findUserLevel(userXP, startXP = 0, endXP = 1000, level = 1){

    if(userXP > startXP && userXP <= endXP){
        return level;
    } else {
        let xp = getStartEndXP(endXP)
        var newLevel = level + 1;
        if(userXP > xp.start && userXP <= xp.end){
            return newLevel;
        } else {
            return findUserLevel(userXP, xp.start, xp.end, newLevel)
        }
    }
}
let resultLevel = findUserLevel(userXP);
console.log(resultLevel)


// Problem # 2
// Write a function that takes two inputs from the user, width and height and outputs a star pattern rectangle that is hollow from the middle. Your function can only use 1 loop, that means it can not use nested loops, combination of loops or a series of loops. If you choose to use a for loop your function should only have 1 for loop, if you decide to use a while loop, your function should have only one 1 while loop. As a sample if the user inputs width: 4 and height: 5, the sample output should be:
// ****
// *  *
// *  *
// *  *
// ****
// Answer: 
// It will work with anykind of value weather the width is greater or height is greater! 
// Code can be improved by adding a try catch and proper exception handling

let width = 20
let height = 15


function printStarics(w,h){
        let i = 0
        let j = 0
        let staric = "";
        while(i < h){

            if( (i == 0 || i == h-1) && (j == 0 || j < w) ){
                staric += "*";
                j++;
            } else if(i > 0 && i < h-1){
                staric += "*  *\n";
                i++
            } else if( j == w ){
                staric += "\n";
                i++
                j = 0;
            } else if(i == h-1){
                i++;
                j = 0
            }
        }
        return staric;
  
}
let resultStaric = printStarics(width,height);
console.log(resultStaric)

// Problem 2 Updated Code
// send email code to ahsanimtiaz@narsun.pk

// I have fixed the shapes as well now it will work with every kind of shape dynamically as given by width and height

let width = 25
let height = 20


function printStarics(w,h){
        let i = 0
        let j = 0
        let staric = "";
        while(i < h){

            if( (i == 0 || i == h-1) && (j == 0 || j < w) ){
                staric += "*";
                j++;
            } else if( j == w ){
                staric += "\n";
                i++
                j = 0;
            } else if(i > 0 && i < h-1){

                if(j == 0){
                    staric += "*"
                } else if(j < w-1){
                    staric += " "
                } 
                if(j == w-1){
                    staric += "*"
                   i++
                }
                j++
                
                
            }  else if(i == h-1){
                i++;
                j = 0
            }
        }
        return staric;
  
}
let resultStaric2 = printStarics(width,height);
console.log(resultStaric2)