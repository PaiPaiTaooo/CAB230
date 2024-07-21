function countUnique(arr) {
    if(arr.length > 0){
        let set = new Set(arr);
        return set.size;
    }else{
        return 0;
    }
}