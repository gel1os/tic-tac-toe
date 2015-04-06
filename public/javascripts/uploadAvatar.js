(function() {
    $(function () {
        function createAlert(message) {
            return '<div class="alert alert-danger" role="alert"><strong>Oh snap!</strong> ' + message + '</div>';
        }

        function appendAlert(el) {
            $('#preview').after(el).fadeIn(300);

            setTimeout(function () {
                $('.alert').fadeOut(300, function(){ $(this).remove();});
            }, 5000);
        }

        function handleFileSelect(evt) {

            var FILE_MAX_SIZE = 500000;

            evt.stopPropagation();
            evt.preventDefault();

            $(evt.target).removeClass("hover");

            var file = !!evt.dataTransfer ?  evt.dataTransfer.files[0] : evt.target.files[0]; // FileList object

            if (!file) {
                return
            }

            if (file.size > FILE_MAX_SIZE)  {

                var alert = createAlert('File is too big. Max-size = 500KB');

                appendAlert(alert);

                return false;
            }

            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function(theFile) {
                return function(e) {

                    var uploadedImage = $('.thumb');
                    if (uploadedImage.length) { uploadedImage.remove(); }

                    var previewImg = $('<img class="thumb" src="' + e.target.result + '" title="' + escape(theFile.name) + '"/>');

                    $('#preview').append(previewImg);
                };
            })(file);

            reader.readAsDataURL(file);
        }

        function handleDragOver(evt) {
            evt.stopPropagation();
            evt.preventDefault();

            if (evt.type === 'dragover') {
                $(evt.target).addClass('hover');
            } else {
                $(evt.target).removeClass('hover');
            }
        }

        $('.avatar').on('change', function (e) {
            handleFileSelect(e)
        });

        $(document).on('click', '.changeAvatar', function () {
            $('form#avatar').toggleClass('hidden');
        });

        var dropZone = document.getElementById('preview');

        dropZone.addEventListener('dragover', handleDragOver, false);
        dropZone.addEventListener('dragleave', handleDragOver, false);
        dropZone.addEventListener('drop', handleFileSelect, false);

        $(document).on('click', '#uploadImage', function (e) {

            var inputFile = $('input[type="file"]'),
                alert;

            if (!inputFile.val()) {
                e.preventDefault();
                $(this).blur();

                if (!$('.alert').length) {
                    alert = createAlert('Try to add file before uploading it!');
                    appendAlert(alert);
                }
            } else if (inputFile.get(0).files[0].size > 500000) {

                e.preventDefault();
                $(this).blur();

                if (!$('.alert').length) {
                    alert = createAlert('Told you, file is too big!');
                    appendAlert(alert);
                }
            }
        })
    });
}());