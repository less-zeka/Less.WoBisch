using System;
using System.Web.Mvc;
using System.Web.Security;
using SignalRChat.Infrastructure;
using SignalRChat.Models;

namespace SignalRChat.Controllers
{
    public class AccountController : Controller
    {
        public ViewResult Login()
        {
            var identifier = Request.QueryString["Identifier"];
            if (string.IsNullOrEmpty(identifier))
            {
                identifier = Guid.NewGuid().ToString();
            }

            var loginModel = new LoginModel
            {
                Identifier = identifier
            };
            return View(loginModel);
        }

        [HttpPost]
        [ActionName("Login")]
        public ActionResult PostLogin(LoginModel loginModel)
        {
            if (!ModelState.IsValid)
            {
                return View(loginModel);
            }
            Response.SetAuthCookie(loginModel.Name, true, string.Format("{0}", loginModel.Identifier));
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [ActionName("SignOut")]
        public ActionResult PostSignOut()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Index", "Home");
        }
    }
}