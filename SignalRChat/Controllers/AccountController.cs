using System;
using System.Globalization;
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
                identifier = DateTime.Now.Ticks.ToString(CultureInfo.InvariantCulture);
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
            if (ModelState.IsValid)
            {
                //Response.SetAuthCookie(loginModel.Name, true, string.Format("{0}_{1}", loginModel.Name, loginModel.Identifier));
                Response.SetAuthCookie(loginModel.Name, true, string.Format("{0}", loginModel.Identifier));

                //FormsAuthentication.SetAuthCookie(loginModel.Name, true);
                return RedirectToAction("Index", "Home");
            }

            return View(loginModel);
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