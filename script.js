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



async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}



async function mineClicked() {
    let username = getLoginCookie("login")
    let userCurrency = document.getElementById("userCurrency")
    let pickaxe = document.getElementsByClassName("pickaxeImg")

    for (let i = 0; i < pickaxe.length; i++) {
        pickaxe[i].classList.remove("animated")
    }

    setTimeout(() => { 
        for (let i = 0; i < pickaxe.length; i++) {
            pickaxe[i].classList.add("animated")  
        } 
    }, 30)

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
        if (acc.oneTimeUpgrades[2] == true) {   // Diamond Deposit
            clicker_multiplier += 7             // ( x8 - 1 )
        }
        
        clicker_extra += acc.normalUpgrades[0] * 40 // Extra Mineshaft ( + $40 )
        clicker_extra += acc.normalUpgrades[1] * 1 // Extra Strength ( + $1 )
        clicker_extra += acc.normalUpgrades[2] * 15 // Extra Helping Hand ( + $15 )

    } catch (error) {
        updateClickerValues()
    }
}



async function loadGameVisuals() {
    try {
        await wait(20)

        let username = getLoginCookie("login")
        let deposit = document.getElementById("depositImg")
        let gameDiv = document.getElementById("gameDiv")
        let acc = await getAccount(username)
        
        if (acc.oneTimeUpgrades[0] == true) {
            deposit.src = "https://static.vecteezy.com/system/resources/previews/026/547/540/non_2x/an-8-bit-retro-styled-pixel-art-illustration-of-an-orange-chromium-rock-free-png.png"
        }
        if (acc.oneTimeUpgrades[1] == true) {
            deposit.src = "https://static.vecteezy.com/system/resources/previews/019/527/056/non_2x/an-8-bit-retro-styled-pixel-art-illustration-of-a-stone-rock-free-png.png"
        }
        if (acc.oneTimeUpgrades[2] == true) {   
            deposit.src = "https://static.vecteezy.com/system/resources/thumbnails/025/212/523/small_2x/an-8-bit-retro-styled-pixel-art-illustration-of-an-aqua-crystal-free-png.png"
        }
        
        if (acc.normalUpgrades[2] >= 1) {
            gameDiv.children[2].style.display = "flex"
        }
        if (acc.normalUpgrades[2] >= 2) {
            gameDiv.children[3].style.display = "flex"
        }
        if (acc.normalUpgrades[2] >= 3) {
            gameDiv.children[4].style.display = "flex"
        }
        if (acc.normalUpgrades[2] >= 4) {
            gameDiv.children[5].style.display = "flex"
        }

    } catch (error) {
        loadGameVisuals()
    }
}



function sortArticles(sortValue) {
    let storeDiv = document.getElementById("storeDiv")

    switch (sortValue) {
        case "None":

            for (let i = 1; i < storeDiv.children.length; i++) {
                storeDiv.children[i].style.display = "grid"
            }
            break;

        case "Deposits":
            
            for (let i = 1; i < storeDiv.children.length; i++) {
                if (storeDiv.children[i].className == "article deposit") {
                    storeDiv.children[i].style.display = "grid"
                } else {
                    storeDiv.children[i].style.display = "none"
                }
            }
            break;

        case "Extras":

        for (let i = 1; i < storeDiv.children.length; i++) {
            if (storeDiv.children[i].className == "article extra") {
                storeDiv.children[i].style.display = "grid"
            } else {
                storeDiv.children[i].style.display = "none"
            }
        }
            break;

        default:
            console.error("UNIDENTIFIED sortValue WAS SELECTED, ERROR COMING FROM sortArticles()")
            break;
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

        let selectElement = document.getElementById("sortSelect")
        selectElement.addEventListener("change", function() {
            sortArticles(selectElement.value)
        })

    }

    if (pageName == "game") {

        loadGameVisuals()

        window.addEventListener('beforeunload', function() {  
            saveMoney()    
        })

        updateClickerValues()
    }
}