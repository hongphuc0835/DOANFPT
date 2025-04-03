using Microsoft.AspNetCore.Mvc;
using productservices.DTO;
using productservices.Implement;
using productservices.Models;

namespace productservices.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TourScheduleController : ControllerBase
    {
        private readonly ITourScheduleService _tourScheduleService;

        public TourScheduleController(ITourScheduleService tourScheduleService)
        {
            _tourScheduleService = tourScheduleService;
        }

        // Lấy tất cả lịch trình và trả về DTO
        [HttpGet("grtAllSchedules")]
       public async Task<IActionResult> GetAll()
        {
            var schedules = await _tourScheduleService.GetAllAsync();
            return Ok(schedules);
        }

        // Lấy lịch trình theo ID và trả về DTO
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var schedule = await _tourScheduleService.GetByIdAsync(id);
            if (schedule == null)
                return NotFound();

            return Ok(schedule);
        }

        // Thêm lịch trình mới, nhận DTO và trả về DTO
        [HttpPost("create")]
       public async Task<IActionResult> Create([FromBody] TourScheduleCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdSchedule = await _tourScheduleService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdSchedule.TourScheduleId }, createdSchedule);
        }

        // Cập nhật lịch trình, nhận DTO và trả về DTO
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TourScheduleUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var success = await _tourScheduleService.UpdateAsync(id, dto);
            if (!success)
                return NotFound();

            return NoContent();
        }


        // Xóa lịch trình
        [HttpDelete("{id}")]
       public async Task<IActionResult> Delete(int id)
        {
            var success = await _tourScheduleService.DeleteAsync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }
    }

}
