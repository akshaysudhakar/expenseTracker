
    const form = document.getElementById('form');
    const div = document.getElementById('div');
    document.addEventListener('DOMContentLoaded', ()=>{
        const token = localStorage.getItem('token')
        axios.get("http://localhost:3000/user/get_expense", {headers : {'authorisation' : token}})
        .then(response => {
            console.log(response.data)
            response.data.forEach(element => {
                const li = document.createElement('li');
                const dlt_btn = document.createElement('button');

                li.textContent = `${element.expense}  ${element.catogory}  ${element.description}`
                dlt_btn.textContent= "delete";
                dlt_btn.onclick = () => handleDelete(token, element.id);
                li.appendChild(dlt_btn);
                div.appendChild(li);
            })
        })
        .catch(err => console.log(err))
    })  



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

    const premium = document.getElementById('payment');
    premium.addEventListener('click', function(){
        window.location.href = "/premium.html"
    })