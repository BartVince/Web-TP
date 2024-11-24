let clicker_extra = 1
let clicker_multiplier = 1

let clicker_MoneyGained = 0

let db
const request = indexedDB.open("MainDatabase", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result
    const objectStore = db.createObjectStore("MainObjectStore", {keyPath: "username"})
    objectStore.createIndex("currency", "currency", { unique: false })
}

request.onsuccess = function(event) {
    db = event.target.result
}

function addData(Account) {
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
    transaction = db.transaction(["MainObjectStore"], "readwrite")
    objectStore = transaction.objectStore("MainObjectStore")
    console.log(objectStore.getAllKeys())

}

function resetData() { // To be called in the console
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

class OneTimeUpgrade {
    constructor(upgradeName, value) {
        this.name = upgradeName
        this.value = value
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
    if (document.getElementById("usernameError").style.display == "flex") {
        return
    }
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
    document.getElementById("createAccountForm").remove()
    document.getElementById("CreatedAccountPrompt").style.display = "grid"
}

async function logInAccount() {
    
    let usernameElement = document.getElementById("username").value
    let passwordElement = document.getElementById("password").value

    let acc = await getAccount(usernameElement)

    if (passwordElement == acc.password) {
        console.log(usernameElement) // LOGIN HERE
        setLoginCookie("login", usernameElement, 1)
        window.location.href='index.html'
    } else {
        passwordElement = document.getElementById("password").value = ""
        alert("Username or Password is incorrect!")
    }
    
}

function logOutAccount() {
    if (confirm("Do you want to log out of " + getLoginCookie("login") + "?")) {
        setLoginCookie("login", "", 0)
        location.reload()
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
    
    for (let i = 0; i < acc.oneTimeUpgrades.length; i++) {
        console.log(acc.oneTimeUpgrades[i])
    }

    for (let i = 0; i < acc.normalUpgrades.length; i++) {
        console.log(acc.normalUpgrades[i])
    }

}

async function BuyUpgrade(cost, upgradeType, index) {
    let username = getLoginCookie("login")
    let acc = await getAccount(username)
    if ((acc.currency - cost) >= 0) {

        let updatedCurrency = acc.currency - cost
        let updatedOneTimeUpgrades = [false, false, false]
        let updatedNormalUpgrades = [0, 0, 0]

        for (let i = 0; i < acc.oneTimeUpgrades.length; i++) {
            updatedOneTimeUpgrades[i] = acc.oneTimeUpgrades[i]
        }

        for (let i = 0; i < acc.normalUpgrades.length; i++) {
            updatedNormalUpgrades[i] = acc.normalUpgrades[i]
        }

        switch (upgradeType) {
            case "oneTime":
                updatedOneTimeUpgrades[index] = true
                break;
            case "normal":
                updatedNormalUpgrades[index] += 1
                break;
            default:
                console.error("upgradeType WAS MISPELLED IN HTML, ERROR COMING FROM BuyUpgrade()")
                break;
        }

        updateData(acc.username, acc.password, updatedCurrency, updatedOneTimeUpgrades, updatedNormalUpgrades)
        location.reload()
    } else {
        if (username == "") {
            alert("You require an account to perform this action!")
        } else {
            alert("Insufficient funds!")
        }
    }
}



async function mineClicked() {
    let username = getLoginCookie("login")
    let userCurrency = document.getElementById("userCurrency")
    let acc = await getAccount(username)
    clicker_MoneyGained += (clicker_extra * clicker_multiplier)
    userCurrency.textContent = "$" + String(acc.currency + clicker_MoneyGained)
}

async function saveMoney() {
    let username = getLoginCookie("login")
    let acc = await getAccount(username)
    let updatedMoney = acc.currency + clicker_MoneyGained
    updateData(acc.username, acc.password, updatedMoney, acc.oneTimeUpgrades, acc.normalUpgrades)
}



async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function showCurrency(user) {
    try {
        await wait(20)

        let userCurrency = document.getElementById("userCurrency")
        let acc = await getAccount(user)
        
        userCurrency.textContent = "$" + String(acc.currency)
    } catch (error) {
        showCurrency(user)
    }
}

async function showUpgrades(user) {
    try {
        await wait(20)

        let acc = await getAccount(user)

        for (let i = 0; i < acc.oneTimeUpgrades.length; i++) {
            if (acc.oneTimeUpgrades[i] == true) {
                document.getElementById("oneTimeUpgrade" + String(i)).children[4].style.display = "flex"
            }
        }

        for (let i = 0; i < acc.normalUpgrades.length; i++) {
            document.getElementById("normal" + String(i)).children[4].textContent = "Amount: " + String(acc.normalUpgrades[i])
        }
        
    } catch (error) {
        showUpgrades(user)
    }
}

async function updateClickerValues() {
    try {
        await wait(20)

        let username = getLoginCookie("login")
        let acc = await getAccount(username)

        if (acc.oneTimeUpgrades[0] == true) {   // Copper Deposit
            clicker_multiplier += 1             // ( x2 - 1 )
        }
        if (acc.oneTimeUpgrades[1] == true) {   // Iron Deposit
            clicker_multiplier += 3             // ( x4 - 1 )
        }
        if (acc.oneTimeUpgrades[1] == true) {   // Diamond Deposit
            clicker_multiplier += 7             // ( x8 - 1 )
        }
        
        clicker_extra += acc.normalUpgrades[0] * 40 // Extra Mineshaft
        clicker_extra += acc.normalUpgrades[1] * 1 // Extra Strength
        clicker_extra += acc.normalUpgrades[2] * 15 // Extra Helping Hand

    } catch (error) {
        updateClickerValues()
    }
}

window.onload = function() { // WHEN PAGE LOADS
    let pageName = document.getElementById("pageName").textContent
    let loggedUser = document.getElementById("loggedUsername")
    let userCurrency = document.getElementById("userCurrency")
    let signUpButton = document.getElementById("signUpButton")
    let logInButton = document.getElementById("logInButton")
    let username = getLoginCookie("login")

    if (username != "") {
        loggedUser.textContent = username
        signUpButton.style.display = "none"
        logInButton.style.display = "none"

        showCurrency(username)

    } else {
        loggedUser.style.display = "none"
        userCurrency.style.display = "none"
    }

    if (pageName == "signUp") {
        let usernameInput = document.getElementById("username")
        usernameInput.addEventListener("input", checkUsernameTaken)
    }

    if (pageName == "home") {
        showUpgrades(username)
    }

    if (pageName == "game") {
        window.addEventListener('beforeunload', function() {  
            saveMoney()    
        })

        updateClickerValues()
    }
}