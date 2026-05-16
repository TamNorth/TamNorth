using System.Text.Json;

namespace Src
{
    public class Test
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Add() => X + Y;
        public int Mul() => X * Y;
        public static string ProcessJson(string json)
        {
            var c = JsonSerializer.Deserialize<Test>(json)!;
            return JsonSerializer.Serialize(new { sum = c.Add(), product = c.Mul() });
        }
    }
}