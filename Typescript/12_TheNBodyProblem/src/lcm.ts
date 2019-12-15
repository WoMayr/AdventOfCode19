export function leastCommonMultiple(numbers: number[]) {
    function gcd(a, b) {
        return !b ? a : gcd(b, a % b);
    }

    function lcm(a, b) {
        return (a * b) / gcd(a, b);   
    }

    var multiple = numbers.reduce((acc, val) => val < acc ? val : acc);
    numbers.forEach(function(n) {
        multiple = lcm(multiple, n);
    });

    return multiple;
}