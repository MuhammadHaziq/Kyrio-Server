const corrections = {
    'xy': 'x',
    'y': 'z',
    'abc': 'bc',
  };

const handleOnChange = (e) => {
    const value = e;
    let words = value.split(" ");
    console.log(words)

    let correctWords = "";
    for(const w of words){
        if(typeof corrections[w] !== 'undefined'){
            correctWords = correctWords + " " + corrections[w];
        } else {
            correctWords = correctWords + " " + w;
        }
    }
    console.log(correctWords)
    
  }

  handleOnChange('abc ');