using System.ComponentModel.DataAnnotations;

namespace SignalRChat.Models
{
    public class LoginModel
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Identifier { get; set; }
    }
}