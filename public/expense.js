
    const form = document.getElementById('form');
    document.addEventListener('DOMContentLoaded',loadDisplayExpense)

        function loadDisplayExpense(event,pagenumber){
            const ul = document.getElementById('listOfExpenses')
            const token = localStorage.getItem('token')
            axios.get("http://localhost:3000/user/get_expense", {headers : {'authorisation' : token,"pagenumber":pagenumber}})
        .then(response => {
            if(response.data.premium){
                document.getElementById('notPremiumUser').style.display = "none" 
            }
            else {
                document.getElementById('PremiumUser').style.display = "none"
            }
            console.log(response.data)
            response.data.expenses.forEach(element => {
                displayExpense(element)
            })
            if(response.data.hasNextPage){
                const nextPageButton = document.createElement("button");
                nextPageButton.textContent = "next Page"
                nextPageButton.onclick = function (){
                    ul.innerHTML = ''
                    loadDisplayExpense(event,response.data.cPageNumber+1)
                } 
                ul.appendChild(nextPageButton)
            }
            if(response.data.hasPreviousPage){
                const previousPageButton = document.createElement("button");
                previousPageButton.textContent = "previous Page"
                previousPageButton.onclick = function (){
                    ul.innerHTML = ''
                    loadDisplayExpense(event,response.data.cPageNumber-1)
                }
                ul.appendChild(previousPageButton) 
            }
        })
        .catch(err => console.log(err))
    }

    function displayExpense(element){
        const token = localStorage.getItem('token')
        const ul = document.getElementById('listOfExpenses');
        ul.innerHTML += `
        <li id=${element.id}>
            ${element.expense} - ${element.catogory} - ${element.description}
            <button onclick='handleDelete(event, ${token},${element.id})'>
                Delete Expense
            </button>
        </li>`
    }



    form.addEventListener('submit', handlesubmit);
    function handlesubmit(event){
        const expense = event.target.expense.value;
        const description = event.target.description.value;
        const catogory = event.target.catogory.value;
        const token = localStorage.getItem('token')
        const data = {
            expense : expense,
            catogory : catogory,
            description : description,
            userId : token
        }
        axios.post("http://localhost:3000/user/add_expense", data)
        .then((response)=> {
            console.log(response.data.data)
        })
        .catch(err => console.log(err))
    }

    function handleDelete(token,id){
        const data = {
            id: id,
            token : token
        }
        axios.post("http://localhost:3000/user/delete_expense",data)
        .then(response =>{
            console.log(response.data)
        })
        .catch(err => console.log(err))
    }


    function buyPremium(){
        window.location.href = "/premium.html"
    }

    function handleLeaderBoard(){
        axios.get("http://localhost:3000/premium/leaderboard")
        .then(response => {
            const div = document.getElementById('premiumUser');
            response.data.forEach(element=> {
                const li = document.createElement('li');
                li.textContent = `${element.name} : ${element.totalExpense}`
                div.appendChild(li)
            })
        })
    }
    
    function download(){
        const token = localStorage.getItem('token')
        axios.get('http://localhost:3000/user/download', { headers: {"Authorization" : token} })
        .then((response) => {
            if(response.status === 201){
                //the bcakend is essentially sending a download link
                //  which if we open in browser, the file would download
                var a = document.createElement("a");
                a.href = response.data.fileUrl;
                a.download = 'myexpense.csv';
                a.click();
            } else {
                throw new Error(response.data.message)
            }
    
        })
        .catch((err) => {
            console.log(err)
        });
    }