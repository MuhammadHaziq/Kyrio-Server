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
let result = printStarics(width,height);
console.log(result)