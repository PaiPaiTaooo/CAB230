function searchBooks(library, authorName) {
    let a=[];
    for(let i=0;i<library.length;i++){
        if(authorName==library[i].author){
            a.push(library[i].title);
        }
    }
    if(a.length==0){
        return "NOT FOUND";
    }else{
        return a;
    }
    
}