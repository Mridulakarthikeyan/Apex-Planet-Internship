function searchCake() {
    var input, filter, productDivs, productName, i;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    productDivs = document.querySelectorAll(".box");
    
    for (i = 0; i < productDivs.length; i++) {
        productName = productDivs[i].getElementsByTagName("p")[0].textContent || productDivs[i].getElementsByTagName("p")[0].innerText;
        if (productName.toUpperCase().indexOf(filter) > -1) {
            productDivs[i].style.display = "";
        } else {
            productDivs[i].style.display = "none";
        }
    }
}