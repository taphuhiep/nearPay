import 'regenerator-runtime/runtime'
import { utils } from 'near-api-js';
import { initContract, login, logout, sendToken, getAccountBalance, convertNearAmount } from './utils'
import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')


async function fetchAccountBalance() {
    let myAccount = window.accountId;
    let balance = await getAccountBalance(myAccount);
    let available = balance.available;
    let balanceInNear = utils.format.formatNearAmount(available);
    balanceInNear = parseFloat(balanceInNear).toFixed(4);
    console.log(balance);
    $('span#account_balance').text(balanceInNear);
}

async function getProduct(productId) {

    let product = await contract.getProductById({ product_id: productId });
    console.log(product);

    let id = product.id;
    let owner = product.owner;
    let title = product.title;
    let description = product.description;
    let image = product.image;
    let price = product.price;
    let amount = product.amount;
    //$("div#products_list").append(product_item);

    let order_message = $('#message').val();

    $('#merchant').text(owner);
    $('#product_title').text(title);
    $('#product_description').text(description);
    $('#product_image').attr('src', image);
    $('#product_amount').text("Remain amount: " + amount);
    $('#product_price').text('Price: ' + price + ' NEAR');

    $('#btn_pay').click(async function(event) {
        event.preventDefault();

        try {
            // send Money to the merchant
            //let result = await sendToken(window.accountId, owner, price);
            //create order
            let BOATLOAD_OF_GAS = 300000000000000;
            console.log("gas: " + BOATLOAD_OF_GAS);
            let trasfer_amount = convertNearAmount(price);
            console.log("transfer amount: " + trasfer_amount);
            let result_order = await contract.createNewOrder({ product: product, buyer: window.accountId, seller: owner, message: order_message, status: "purchased" }, BOATLOAD_OF_GAS, trasfer_amount);

            console.log("order result:" + result_order);

            if (result.status.SuccessValue === "" && result_order) {

                Swal.fire({
                    title: 'DONE!',
                    text: 'PRODUCT PURCHASED!',
                    icon: 'success',
                    confirmButtonText: 'Cool'
                });
            } else {
                Swal.fire({
                    title: 'ERROR!',
                    text: 'ERROR occured! Please try again...! ' + result + ". " + result_order,
                    icon: 'error',
                    confirmButtonText: 'Cool'
                });
            }
        } catch (error) {
            Swal.fire({
                title: 'ERROR!',
                text: "Message: " + error,
                icon: 'error',
                confirmButtonText: 'Cool'
            });
        }

    });
}

async function getOrders() {
    let orders = await contract.getOrdersByOwner({ owner: window.accountId });
    console.log(orders);

    orders.forEach((order) => {
        let id = order.id;
        //let owner = order.seller;
        let created_at = order.created_at;
        let buyer = order.buyer;
        let message = order.message;
        let status = order.status;

        let product = order.product;
        let product_id = product.id;
        let title = product.title;
        let description = product.description;
        let image = product.image;
        let price = product.price;
        let amount = product.amount;

        //let order_item = '<div class="col-md-4 mb-3"><div class="card h-100"><div class="d-flex justify-content-between position-absolute w-100"><div class="label-new"><span class="text-white bg-success small d-flex align-items-center px-2 py-1"><i class="fa fa-star" aria-hidden="true"></i><span class="ml-1">New</span></span></div><div class="label-sale"><span class="text-white bg-primary small d-flex align-items-center px-2 py-1"><i class="fa fa-tag" aria-hidden="true"></i><span class="ml-1">Sale</span></span></div></div><a href="#"><img src="'+ image +'" class="card-img-top" alt="Product"></a><div class="card-body px-2 pb-2 pt-1"><div class="d-flex justify-content-between"><div><p class="h4 text-primary">$ '+ price +'</p></div><div><a href="#" class="text-secondary lead" data-toggle="tooltip" data-placement="left" title="Compare"><i class="fa fa-line-chart" aria-hidden="true"></i></a></div></div><p class="mb-0"><strong><a href="#" class="text-secondary">'+ title +'</a></strong></p><p class="mb-1"><small><a href="#" class="text-secondary">'+ amount +'</a></small></p><div class="d-flex mb-3 justify-content-between">'+ description +'</div><div class="d-flex justify-content-between"><div class="col px-0"><button class="btn btn-outline-primary btn-block btn_buy" id="'+ id+'" owner="'+ buyer +'" price="'+ price +'">BUY<i class="fa fa-shopping-basket" aria-hidden="true"></i></button></div></div></div></div></div>';
        let order_item2 = '<div class="col-md-4 mb-3"><div class="card" style="width:400px"><img class="card-img-top" src="' + image + '" alt="Card image" style="width:100%"><div class="card-body"><h4 class="card-title">[ID: ' + product_id + '] ' + title + '</h4><small>Oder time: ' + new Date(parseInt(created_at) / 1000) + '</small><p class="card-text">PRICE: ' + price + ' NEAR</p><p class="card-text">ORDER STATUS: ' + status + '</p><p class="card-text">BUYER MESSAGE: ' + message + '</p><a href="#" class="btn btn-primary">BUYER: ' + buyer + '</a></div></div></div>';
        $("div#orders_list").append(order_item2);
    });
}

async function addProduct() {
    let title = $('input#title').val();
    let description = $('input#description').val();
    let image = $('input#image').val();
    let price = $('input#price').val();
    let amount = $('input#amount').val();

    try {
        let product_id = await window.contract.addNewProduct({
            title: title,
            description: description,
            image: image,
            price: price,
            amount: amount
        });

        product_id = parseInt(product_id) + 1;

        Swal.fire({
            title: 'DONE!',
            text: 'NEW PRODUCT ADDED!',
            icon: 'success',
            confirmButtonText: 'Cool'
        });

        let base_payment_url = "https://1234-green-kiwi-5n1qivfn.ws-us23.gitpod.io/?action=pay&productId=";
        let QRCode_generator_url = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=";

        let QRCode_image_src = QRCode_generator_url + base_payment_url + product_id;

        $('img#product_qrcode').attr('src', QRCode_image_src);
        $('input#product_link').val(base_payment_url + product_id);

        $('#section_payment').show();

    } catch (e) {
        Swal.fire({
            title: 'ERROR!',
            text: 'ERROR occured when add new product! Please try again...!',
            icon: 'error',
            confirmButtonText: 'Cool'
        });
    } finally {
        console.log("product added");
    }
}

$(document).ready(async function() {

    $('div#payment_card').hide();

    var urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('productId')) {
        //hide other UI components
        $('div.container').empty();

        //show payment card
        $('div#payment_card').show();

        let productId = urlParams.get('productId');
        console.log(productId);

        //fetch product info
        await getProduct(productId);
    } else {
        $('div#section_payment').hide();
        await getOrders();
    }

    await fetchAccountBalance();

    $('button#submit').click(async function(e) {
        e.preventDefault();
        $(this).html('<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Confirming...').addClass('disabled');
        await addProduct();

        $(this).text('Submit').removeClass('disabled');
    });

    $('button.btn_transfer').click(function() {
        let id = $(this).attr("id");
        $('p#transfer_nft_id').text(id);
    });

    $('button#btn_confirm_transfer').click(async function() {
        let receiver_id = $('input#transfer_receiver').val();
        let token_id = $('p#transfer_nft_id').text();
        //token_id = parseInt(token_id);

        await transferNFT(receiver_id, token_id);
    });

    $('button#btn_test').click(async function() {
        // let rs1 = await window.contract.getNFTOwner({tokenId:'2'});
        // let rs2 = await window.contract.getNFTMetaData({tokenId:'2'});
        // let rs3 = await window.contract.getAllNFTsByOwner({accountId: 'madlife.testnet'});
        //let rs1 = await sendToken(window.accountId, 'madlife.testnet', 10);

        //console.log(rs1);
        // console.log(rs2);
        // console.log(rs3);
        //alert(rs1);
    });
});

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
    document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
    document.querySelector('#signed-in-flow').style.display = 'block'

    document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
        el.innerText = window.accountId
    })

    // populate links in the notification box
    const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
    accountLink.href = accountLink.href + window.accountId
    accountLink.innerText = '@' + window.accountId
    const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
    contractLink.href = contractLink.href + window.contract.contractId
    contractLink.innerText = '@' + window.contract.contractId

    // update with selected networkId
    accountLink.href = accountLink.href.replace('testnet', networkId)
    contractLink.href = contractLink.href.replace('testnet', networkId)
        //fetch greeting

}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
    .then(() => {
        if (window.walletConnection.isSignedIn()) signedInFlow()
        else signedOutFlow()
    })
    .catch(console.error)