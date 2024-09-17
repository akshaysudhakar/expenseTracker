const stripe = Stripe('pk_test_51PzdsuLT6WvY2uR5fTptUSpA7hAl2oDyY7LPLLBwOOWZMazGU4g7Z4RMxrOpNGP9Ah3ZdJISNgIEGT0N3fUwsl8a005ADMPAvn'); // Replace with your Stripe publishable key
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#payment');

const form = document.getElementById('payment_form');

form.addEventListener('submit', handlePayment)

async function handlePayment(event){
    event.preventDefault()
    const user_token = localStorage.getItem('token')

    try{
        const {paymentMethod,error} = await stripe.createPaymentMethod({
            type: 'card', 
            card: cardElement
        })
        if(error){
            console.log("an error during stripe create token", error)
            return
        }

        const data = {
            payment_id : paymentMethod.id,
            user_token : user_token
        }

        const result = await axios.post("http://localhost:3000/admin/buy_premium",data)

        console.log(result)
    }
    catch(err){
        console.log(err)
    }
}