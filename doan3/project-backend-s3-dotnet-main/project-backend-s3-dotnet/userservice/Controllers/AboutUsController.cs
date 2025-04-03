using System.Collections.Generic;
using System.Threading.Tasks;
using userservice.Modes;
using userservice.Services;
using Microsoft.AspNetCore.Mvc;

namespace userservice.Controllers
{
    [ApiController]
    [Route("api/abouts")]
    public class AboutUsController : ControllerBase
    {
        private readonly IAboutUsService _aboutUsService;

        public AboutUsController(IAboutUsService aboutUsService)
        {
            _aboutUsService = aboutUsService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var aboutUsList = await _aboutUsService.GetAllAsync();
            return Ok(aboutUsList);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var aboutUs = await _aboutUsService.GetByIdAsync(id);
            if (aboutUs == null) return NotFound("About Us not found.");
            return Ok(aboutUs);
        }

        [HttpPost]
        public async Task<IActionResult> Create(AboutUs aboutUs)
        {
            var created = await _aboutUsService.CreateAsync(aboutUs);
            return CreatedAtAction(nameof(GetById), new { id = created.AboutId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AboutUs aboutUs)
        {
            var updated = await _aboutUsService.UpdateAsync(id, aboutUs);
            if (updated == null) return NotFound("About Us not found.");
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _aboutUsService.DeleteAsync(id);
            if (!deleted) return NotFound("About Us not found.");
            return NoContent();
        }
    }
}
