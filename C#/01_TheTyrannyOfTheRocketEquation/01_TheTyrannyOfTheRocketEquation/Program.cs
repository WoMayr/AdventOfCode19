using System;
using System.IO;
using System.Linq;

namespace _01_TheTyrannyOfTheRocketEquation
{
    class Program
    {
        static void Main(string[] args)
        {
            int[] masses = File.ReadAllLines("input.txt").Select(x => int.Parse(x)).ToArray();

            int fuel = masses.Sum(x => CalculateFuel(x));

            Console.WriteLine(fuel);
        }



        private static int CalculateFuelBase(int mass)
        {
            return (int)Math.Floor(mass / 3.0) - 2;
        }

        private static int CalculateFuel(int mass)
        {
            int total = 0;
            int currMass = mass;

            int lastFuel;
            do
            {
                lastFuel = CalculateFuelBase(currMass);
                if (lastFuel < 0)
                {
                    lastFuel = 0;
                }
                currMass = lastFuel;
                total += lastFuel;
            } while (lastFuel != 0);

            return total;
        }
    }
}
