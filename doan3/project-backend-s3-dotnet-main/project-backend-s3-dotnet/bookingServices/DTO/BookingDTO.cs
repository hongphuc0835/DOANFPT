namespace bookingServices.DTO
{
    public class BookingDTO
    {
        public int TourId { get; set; }
        public int UserId { get; set; }
        public string Phone { get; set; }
        public string TourPackage { get; set; }
        public DateTime DepartureDate { get; set; } // Ngày khởi hành
        public DateTime BookingDate { get; set; } = DateTime.Now;
        public string Status { get; set; }
        public int Adult { get; set; } // số lượng người lớn
        public int Children { get; set; } // số lượng trẻ em
        public int TotalPrice { get; set; }
        public int PaymentId { get; set; }
        public string Text { get; set; }
         public string Email { get; set; }
    }
}