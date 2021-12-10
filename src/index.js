import 'regenerator-runtime/runtime'
import { utils } from 'near-api-js';
import { initContract, login, logout, sendToken, getAccountBalance } from './utils'
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

    $('#merchant').text("MERCHANT: " + owner);
    $('#product_title').text(title);
    $('#product_description').text(description);
    $('#product_image').attr('src', image);
    $('#product_amount').text("Remain amount: " + amount);
    $('#product_price').text('Price: ' + price + ' NEAR');

    $('#btn_pay').click(async function(e) {
        e.preventDefault();

        try {
            // send Money to the merchant
            let result = await sendToken(window.accountId, owner, price);
            //create order
            let result_order = await contract.createNewOrder({ product: product, buyer: window.accountId, seller: owner, message: order_message, status: "purchased" });

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
        } catch (e) {
            Swal.fire({
                title: 'ERROR!',
                text: "Message: " + e,
                icon: 'error',
                confirmButtonText: 'Cool'
            });
        }

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
        let rs1 = await sendToken(window.accountId, 'madlife.testnet', 10);

        console.log(rs1);
        // console.log(rs2);
        // console.log(rs3);
        alert(rs1);
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