namespace productservices.DTO
{
    public class TourDTO
    {

        public int TourId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string TourDepartureLocation { get; set; }
        public double Rating { get; set; }
        public string ImageUrl { get; set; }
        public string TransportMode { get; set; }
        public string Duration { get; set; }
        public bool Active { get; set; }
        public int DestinationId { get; set; }
    }
}