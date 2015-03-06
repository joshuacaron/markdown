function loadFont(name,style,weight,url){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    xhr.onreadystatechange = function() {
        console.log("STATE", xhr.readyState);
        if (xhr.readyState == 4) {
            var myfontblob = window.URL.createObjectURL(xhr.response);
            var newStyle = document.createElement('style');
            newStyle.appendChild(document.createTextNode("\
            @font-face {\
                font-family:" + name +";\
                font-style:" + style + ";\
                font-weight:" + weight + ";\
                src: url('" + myfontblob + "') format(woff2);\
            }\
            "));
            document.head.appendChild(newStyle);
        }
    };
    xhr.send();
}

loadFont("'Open Sans'","normal","400","https://fonts.gstatic.com/s/opensans/v10/cJZKeOuBrn4kERxqtaUH3VtXRa8TVwTICgirnJhmVJw.woff2")
loadFont("'Open Sans'","italic","400","https://fonts.gstatic.com/s/opensans/v10/xjAJXh38I15wypJXxuGMBo4P5ICox8Kq3LLUNMylGO4.woff2")
loadFont("'Open Sans'","normal","700","https://fonts.gstatic.com/s/opensans/v10/k3k702ZOKiLJc3WVjuplzBUOjZSKWg4xBWp_C_qQx0o.woff2")
loadFont("'Open Sans'","italic","700","https://fonts.gstatic.com/s/opensans/v10/PRmiXeptR36kaC0GEAetxolIZu-HDpmDIZMigmsroc4.woff2")