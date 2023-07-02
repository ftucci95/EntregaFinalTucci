//Acá defino las variables del DOM


let login_button = document.getElementById("login-button");
let signup_button = document.getElementById("signup-button");

login_button.addEventListener("click",login_clicked());
signup_button.addEventListener("click",signup_clicked());

function loginClicked() 
{
    //animate button
    animateLoginButton(login_button);
    //login function
    //proceed to user not registered, wrong password try again, or estado_me
}

function signupClicked()
{
    //animate button
    //signup function
    //proceed to username taken try again, or registration succesful
}

function logIn(user,password)
{   
    let USER_ERROR = OK;
    let PASS_ERROR = OK;
    let HASH_ERROR = OK;
    let userHash = null;
    let hash = null;
    USER_ERROR = isUserRegistered(user);
    if (USER_ERROR == ERROR)
    {
        unregisteredUser();        
    }
    else
    {
        userHash = retrieveUserHash(user);
        PASS_ERROR = validatePassword(password);
        if (PASS_ERROR == ERROR)
        {
            invalidPassword();
        }

        else
        {
            hash = hashUserPassword(user,password);
            FLAG_ERROR = compareHashes(hash,userHash)
        }
    }

    
    


}