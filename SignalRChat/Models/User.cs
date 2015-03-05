using System.Collections.Generic;
using System.Drawing;

namespace SignalRChat.Models
{
    public class User
    {
        public string Identifier { get; set; }
        public string Name { get; set; }
        public HashSet<string> ConnectionIds { get; set; }
        public Color PinColor { get; set; }
    }
}