const request = indexedDB.open("MainDatabase", 1)

request.onupgradeneeded = function(event) {
    db = event.target.result
    objectStore = db.createObjectStore("MainObjectStore", {keyPath: "username"})
    objectStore.createIndex("currency", "currency", { unique: false })
}

function addData(Account) {
    db = request.result
    transaction = db.transaction(["MainObjectStore"], "readwrite")
    objectStore = transaction.objectStore("MainObjectStore")
    
    addRequest = objectStore.add({ 
        username: Account.username, 
        password: Account.password, 
        currency: Account.currency, 
        oneTimeUpgrades: Account.oneTimeUpgrades,
        normalUpgrades: Account.normalUpgrades
    })
}

function getData(username) {
    return new Promise((resolve) => {
        db = request.result
        transaction = db.transaction(["MainObjectStore"], "readonly")
        objectStore = transaction.objectStore("MainObjectStore")
        
        getRequest = objectStore.getAll(username)

        getRequest.onsuccess = function(event) {
            result = event.target.result
            data = JSON.stringify(result, null, 1)
            resolve(data)
        }
    })
}

function updateData(_username, _password, _currency, _oneTimeUpgrades, _normalUpgrades) { // new data must be in this form: {username: "keer", password: "aaa", currency: 1000}
    newData = { username: _username, password: _password, currency: _currency, oneTimeUpgrades: _oneTimeUpgrades, normalUpgrades: _normalUpgrades }
    db = request.result
    transaction = db.transaction(["MainObjectStore"], "readwrite")
    objectStore = transaction.objectStore("MainObjectStore")
    updateRequest = objectStore.put(newData)
}
















function logData(username) { // To be called in the console
    getData(username).then(data => {
        console.log(data)
    })
}

function logKeys() { // To be called in the console
    db = request.result
    transaction = db.transaction(["MainObjectStore"], "readwrite")
    objectStore = transaction.objectStore("MainObjectStore")
    console.log(objectStore.getAllKeys())

}

function resetData() { // To be called in the console
    db = request.result
    transaction = db.transaction(["MainObjectStore"], "readwrite")
    objectStore = transaction.objectStore("MainObjectStore")
    clearRequest = objectStore.clear()
    clearRequest.onsuccess = function() {
        console.log("All data deleted successfully")
    }
}

class Account {
    constructor(username, password, currency, oneTimeUpgrades, normalUpgrades) {
        this.username = username
        this.password = password
        this.currency = currency
        this.oneTimeUpgrades = oneTimeUpgrades
        this.normalUpgrades = normalUpgrades
    }
}











function setLoginCookie(cookieName, username, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + (exdays*24*60*60*1000))
    let expires = "expires="+ d.toUTCString()
    document.cookie = cookieName + "=" + username + ";" + expires + ";path=/"
}

function getLoginCookie(cookieName) {
    let name = cookieName + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for(let i = 0; i <ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == ' ') {
        c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length)
    }
    }
    return ""
}

function clearAllCookies() { // To be called in the console
    let cookies = document.cookie.split(";")
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i]
        let eqPos = cookie.indexOf("=")
        let name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    }
}




function checkUsernameTaken() {
    usernameElement = document.getElementById("username").value

    getData(usernameElement).then(data => {

        if (data != "[]") {
            document.getElementById("usernameError").style.display = "flex"
        } else {
            document.getElementById("usernameError").style.display = "none"
        }
    
    })
}

function createAccount() {
    let usernameElement = document.getElementById("username").value
    let passwordElement = document.getElementById("password").value
    if (usernameElement != "" && passwordElement != "") {
        username = usernameElement
        password = passwordElement
    } else {
        return
    }
    acc = new Account(username, password, 0, [false, false, false], [0, 0, 0])
    addData(acc)
}

async function logInAccount() {
    
    let usernameElement = document.getElementById("username").value
    let passwordElement = document.getElementById("password").value

    let acc = await getAccount(usernameElement)

    if (passwordElement == acc.password) {
        console.log(usernameElement) // LOGIN HERE
        setLoginCookie("login", usernameElement, 1)
    } else {
        passwordElement = document.getElementById("password").value = ""
        alert("Username or Password is incorrect!")
    }
    
}

async function getAccount(username) {
    
    if (username == null){
        return false
    }
    
    let data = await getData(username)
    
    if (data == "[]"){
        return false
    } 
    obj = JSON.parse(data)
    return obj[0]
}

async function test(user) {
    let acc = await getAccount(user)
    console.log(acc.username)
    console.log(acc.password)
    console.log(acc.oneTimeUpgrades[0])
    console.log(acc.oneTimeUpgrades[1])
    console.log(acc.oneTimeUpgrades[2])
    return user
}

window.onload = function() {
    let pageName = document.getElementById("pageName").textContent
    let loggedUser = document.getElementById("loggedUsername")

    console.log(loggedUser.textContent)
    console.log(getLoginCookie("login"))

    if (getLoginCookie("login") != "") {
        console.log("should work")
        loggedUser.textContent = getLoginCookie("login")
    }

    if (pageName == "signUp") {
        let usernameInput = document.getElementById("username")
        usernameInput.addEventListener("input", checkUsernameTaken)
    }
}