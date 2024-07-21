function pushMultiplySum(vec,x) {
    let sum=0
    vec.push(x);
    for(let i =0; i<vec.length; i++){
        sum+=vec[i];
    }
    return sum*2;
}