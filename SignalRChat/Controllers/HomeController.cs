using System.Web.Mvc;
using SignalRChat.Hubs;
using SignalRChat.Infrastructure;
using SignalRChat.Models;

namespace SignalRChat.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        public ViewResult Index()
        {
            var model = new User
            {
                Name = User.Identity.Name,
                Identifier = HttpContext.GetCurrentLogonUserIdentifier()
            };
            return View(model);
        }

        public PartialViewResult UserLegend()
        {
            var model = ChatHub.GetUsersByIdentifier(HttpContext.GetCurrentLogonUserIdentifier());
            return PartialView("_UserLegend", model);
        }
    }
}