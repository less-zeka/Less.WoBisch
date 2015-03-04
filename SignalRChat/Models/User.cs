using System.Collections.Generic;

namespace SignalRChat.Models
{
    public class User
    {
        public string Identifier { get; set; }
        public string Name { get; set; }
        public HashSet<string> ConnectionIds { get; set; }
    }
}