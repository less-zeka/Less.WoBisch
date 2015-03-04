using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;

namespace SignalRChat.Models
{
    public class LoginModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        [HiddenInput(DisplayValue = false)]
        public string Identifier { get; set; }
    }
}